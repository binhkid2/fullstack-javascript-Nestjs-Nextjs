import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { EmailService } from './email.service';
import { MagicLinkToken } from './entities/magic-link-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { OAuthAccount } from './entities/oauth-account.entity';
import { User } from '../users/user.entity';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '../common/strategies/jwt-refresh.strategy';
import { GoogleStrategy } from '../common/strategies/google.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([
      User,
      MagicLinkToken,
      RefreshToken,
      OAuthAccount,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, JwtStrategy, JwtRefreshStrategy, GoogleStrategy],
})
export class AuthModule {}
