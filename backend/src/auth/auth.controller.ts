import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { MagicLinkRequestDto } from './dto/magic-link-request.dto';
import { MagicLinkVerifyDto } from './dto/magic-link-verify.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetDto } from './dto/password-reset.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('magic-link')
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({ summary: 'Request magic link' })
  requestMagicLink(@Body() dto: MagicLinkRequestDto) {
    return this.authService.requestMagicLink(dto.email);
  }

  @Get('magic-link/verify')
  @ApiOperation({ summary: 'Verify magic link' })
  @ApiQuery({ name: 'email', required: true })
  @ApiQuery({ name: 'token', required: true })
  verifyMagicLink(@Query() dto: MagicLinkVerifyDto) {
    return this.authService.verifyMagicLink(dto.email, dto.token);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register with email and password' })
  @Throttle({ default: { limit: 5, ttl: 60 } })
  register(@Body() dto: RegisterDto) {
    return this.authService.registerWithPassword(dto.email, dto.password, dto.name);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @Throttle({ default: { limit: 10, ttl: 60 } })
  login(@Body() dto: LoginDto) {
    return this.authService.loginWithPassword(dto.email, dto.password);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @Throttle({ default: { limit: 5, ttl: 60 } })
  requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password' })
  resetPassword(@Body() dto: PasswordResetDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth start' })
  googleAuth() {
    return { ok: true };
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const payload = await this.authService.handleGoogleLogin({
      providerId: req.user.providerId,
      email: req.user.email,
      name: req.user.name,
    });

    const baseUrl =
      this.configService.get<string>('magicLink.baseUrl') ??
      this.configService.get<string>('app.baseUrl') ??
      'http://localhost:3001';

    const url = new URL('/oauth/google', baseUrl);
    url.searchParams.set('accessToken', payload.accessToken);
    url.searchParams.set('refreshToken', payload.refreshToken);
    url.searchParams.set('email', payload.user.email);
    url.searchParams.set('name', payload.user.name ?? '');
    url.searchParams.set('role', payload.user.role);
    url.searchParams.set('id', payload.user.id);

    return res.redirect(url.toString());
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh tokens' })
  refreshTokens(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Revoke refresh token' })
  @ApiBearerAuth()
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.revokeRefreshToken(dto.refreshToken);
  }
}
