import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ThrottlerGuard } from '@nestjs/throttler';
import { User } from './users/user.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { MagicLinkToken } from './auth/entities/magic-link-token.entity';
import { OAuthAccount } from './auth/entities/oauth-account.entity';
import { PasswordResetToken } from './auth/entities/password-reset-token.entity';
import { BlogPostsModule } from './blog-posts/blog-posts.module';
import { BlogPost } from './blog-posts/blog-post.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('db.host'),
        port: configService.get<number>('db.port'),
        username: configService.get<string>('db.username'),
        password: configService.get<string>('db.password'),
        database: configService.get<string>('db.name'),
        ssl: configService.get<boolean>('db.ssl')
          ? { rejectUnauthorized: false }
          : false,
        entities: [
          User,
          RefreshToken,
          MagicLinkToken,
          OAuthAccount,
          PasswordResetToken,
          BlogPost,
        ],
        synchronize: false,
        logging: false,
      }),
    }),
    UsersModule,
    AuthModule,
    HealthModule,
    BlogPostsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
