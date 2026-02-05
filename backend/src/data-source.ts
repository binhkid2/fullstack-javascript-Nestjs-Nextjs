import 'reflect-metadata';
import { DataSource } from 'typeorm';
import configuration from './config/configuration';
import { User } from './users/user.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { MagicLinkToken } from './auth/entities/magic-link-token.entity';
import { OAuthAccount } from './auth/entities/oauth-account.entity';
import { PasswordResetToken } from './auth/entities/password-reset-token.entity';
import { BlogPost } from './blog-posts/blog-post.entity';

const config = configuration();
const isProd = process.env.NODE_ENV === 'production';
const migrations = [isProd ? 'dist/migrations/*.js' : 'src/migrations/*.ts'];

export default new DataSource({
  type: 'postgres',
  url: config.db.url,
  ssl: config.db.ssl ? { rejectUnauthorized: false } : false,
  entities: [
    User,
    RefreshToken,
    MagicLinkToken,
    OAuthAccount,
    PasswordResetToken,
    BlogPost,
  ],
  migrations,
  synchronize: false,
});
