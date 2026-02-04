export default () => ({
  app: {
    port: parseInt(process.env.APP_PORT ?? '3000', 10),
    host: process.env.APP_HOST ?? 'localhost',
    baseUrl: process.env.APP_BASE_URL ?? 'http://localhost:3000',
  },
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    name: process.env.DB_NAME ?? 'nestjs_db',
    ssl: (process.env.DB_SSL ?? 'false') === 'true',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'change_me_access',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '900s',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'change_me_refresh',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? '',
  },
  magicLink: {
    ttlSeconds: parseInt(process.env.MAGIC_LINK_TOKEN_TTL_SECONDS ?? '900', 10),
    emailFrom: process.env.MAGIC_LINK_EMAIL_FROM ?? 'no-reply@example.com',
    baseUrl:
      process.env.MAGIC_LINK_BASE_URL ??
      process.env.APP_BASE_URL ??
      'http://localhost:3001',
  },
  passwordReset: {
    ttlSeconds: parseInt(
      process.env.RESET_PASSWORD_TOKEN_TTL_SECONDS ?? '900',
      10,
    ),
  },
  email: {
    host: process.env.EMAIL_SERVER_HOST ?? '',
    port: parseInt(process.env.EMAIL_SERVER_PORT ?? '587', 10),
    user: process.env.EMAIL_SERVER_USER ?? '',
    password: process.env.EMAIL_SERVER_PASSWORD ?? '',
    from: process.env.EMAIL_FROM ?? 'noreply@example.com',
  },
});
