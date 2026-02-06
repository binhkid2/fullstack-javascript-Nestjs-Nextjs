-- Reset schema objects created by init.sql

ALTER TABLE "password_reset_tokens" DROP CONSTRAINT IF EXISTS "FK_password_reset_tokens_user";
ALTER TABLE "oauth_accounts" DROP CONSTRAINT IF EXISTS "FK_oauth_accounts_user";
ALTER TABLE "magic_link_tokens" DROP CONSTRAINT IF EXISTS "FK_magic_link_tokens_user";
ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "FK_refresh_tokens_user";

DROP INDEX IF EXISTS "idx_blog_posts_views";
DROP INDEX IF EXISTS "idx_blog_posts_featured_created_at";
DROP INDEX IF EXISTS "idx_blog_posts_status_created_at";
DROP INDEX IF EXISTS "IDX_oauth_provider_providerId";
DROP INDEX IF EXISTS "IDX_users_email";

DROP TABLE IF EXISTS "blog_posts";
DROP TABLE IF EXISTS "oauth_accounts";
DROP TABLE IF EXISTS "password_reset_tokens";
DROP TABLE IF EXISTS "magic_link_tokens";
DROP TABLE IF EXISTS "refresh_tokens";
DROP TABLE IF EXISTS "users";

DROP TYPE IF EXISTS "public"."post_status";
DROP TYPE IF EXISTS "public"."users_role_enum";

DROP EXTENSION IF EXISTS "uuid-ossp";
