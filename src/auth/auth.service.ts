import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash, randomUUID } from 'crypto';
import { UsersService } from '../users/users.service';
import { EmailService } from './email.service';
import { User } from '../users/user.entity';
import { MagicLinkToken } from './entities/magic-link-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { OAuthAccount } from './entities/oauth-account.entity';
import { Role } from '../roles/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(MagicLinkToken)
    private readonly magicLinkRepo: Repository<MagicLinkToken>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(OAuthAccount)
    private readonly oauthRepo: Repository<OAuthAccount>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async requestMagicLink(email: string) {
    let user = await this.usersService.findByEmail(email);
    if (!user) {
      user = await this.usersService.createUser(email, undefined, Role.MEMBER);
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);

    const ttlSeconds = this.configService.get<number>('magicLink.ttlSeconds') ?? 900;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const magicLink = this.magicLinkRepo.create({
      tokenHash,
      expiresAt,
      user,
    });
    await this.magicLinkRepo.save(magicLink);

    const baseUrl = this.configService.get<string>('app.baseUrl');
    const link = `${baseUrl}/auth/magic-link/verify?email=${encodeURIComponent(
      user.email,
    )}&token=${token}`;

    await this.emailService.sendMagicLink(user.email, link);

    return { ok: true };
  }

  async verifyMagicLink(email: string, token: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid magic link');
    }

    const tokenHash = this.hashToken(token);
    const magicLink = await this.magicLinkRepo.findOne({
      where: {
        user: { id: user.id },
        tokenHash,
      },
      relations: ['user'],
    });

    if (!magicLink) {
      throw new UnauthorizedException('Invalid magic link');
    }

    if (magicLink.usedAt) {
      throw new BadRequestException('Magic link already used');
    }

    if (magicLink.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Magic link expired');
    }

    magicLink.usedAt = new Date();
    await this.magicLinkRepo.save(magicLink);

    return this.issueTokens(user);
  }

  async handleGoogleLogin(googleUser: {
    providerId: string;
    email?: string;
    name?: string;
  }) {
    const provider = 'google';
    let account = await this.oauthRepo.findOne({
      where: { provider, providerId: googleUser.providerId },
      relations: ['user'],
    });

    if (!account) {
      let user: User | null = null;
      if (googleUser.email) {
        user = await this.usersService.findByEmail(googleUser.email);
      }

      if (!user) {
        const fallbackEmail =
          googleUser.email ?? `google_${googleUser.providerId}@example.local`;
        user = await this.usersService.createUser(
          fallbackEmail,
          googleUser.name,
          Role.MEMBER,
        );
      }

      account = this.oauthRepo.create({
        provider,
        providerId: googleUser.providerId,
        email: googleUser.email,
        user,
      });
      await this.oauthRepo.save(account);
    }

    return this.issueTokens(account.user);
  }

  async refreshTokens(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);

    const tokenHash = this.hashToken(refreshToken);
    const record = await this.refreshTokenRepo.findOne({
      where: { id: payload.tokenId },
      relations: ['user'],
    });

    if (!record || record.revokedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (record.tokenHash !== tokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    record.revokedAt = new Date();
    await this.refreshTokenRepo.save(record);

    return this.issueTokens(record.user);
  }

  async revokeRefreshToken(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);
    const record = await this.refreshTokenRepo.findOne({
      where: { id: payload.tokenId },
    });

    if (record && !record.revokedAt) {
      record.revokedAt = new Date();
      await this.refreshTokenRepo.save(record);
    }

    return { ok: true };
  }

  private async issueTokens(user: User) {
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
      },
    );

    const tokenId = randomUUID();
    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        tokenId,
      },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      },
    );

    const expiresAt = this.computeRefreshExpiry(
      this.configService.get<string>('jwt.refreshExpiresIn') ?? '7d',
    );

    const tokenHash = this.hashToken(refreshToken);
    const record = this.refreshTokenRepo.create({
      id: tokenId,
      tokenHash,
      expiresAt,
      user,
    });

    await this.refreshTokenRepo.save(record);

    return { accessToken, refreshToken };
  }

  private verifyRefreshToken(refreshToken: string) {
    try {
      return this.jwtService.verify<{ sub: string; tokenId: string }>(
        refreshToken,
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private computeRefreshExpiry(value: string) {
    const seconds = this.parseDurationToSeconds(value);
    return new Date(Date.now() + seconds * 1000);
  }

  private parseDurationToSeconds(value: string) {
    const match = /^([0-9]+)(s|m|h|d)$/i.exec(value);
    if (!match) {
      return 7 * 24 * 60 * 60;
    }

    const amount = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 's':
        return amount;
      case 'm':
        return amount * 60;
      case 'h':
        return amount * 60 * 60;
      case 'd':
        return amount * 24 * 60 * 60;
      default:
        return 7 * 24 * 60 * 60;
    }
  }
}
