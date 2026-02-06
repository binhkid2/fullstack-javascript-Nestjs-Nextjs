import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1700000000000 implements MigrationInterface {
  name = 'Init1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM ('ADMIN', 'MANAGER', 'MEMBER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."post_status" AS ENUM ('draft', 'published', 'archived')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "name" character varying,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'MEMBER',
        "passwordHash" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`,
    );

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tokenHash" character varying NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "revokedAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "userId" uuid,
        CONSTRAINT "PK_refresh_tokens_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "magic_link_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tokenHash" character varying NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "usedAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "userId" uuid,
        CONSTRAINT "PK_magic_link_tokens_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "oauth_accounts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "provider" character varying NOT NULL,
        "providerId" character varying NOT NULL,
        "email" character varying,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "userId" uuid,
        CONSTRAINT "PK_oauth_accounts_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tokenHash" character varying NOT NULL,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "usedAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "userId" uuid,
        CONSTRAINT "PK_password_reset_tokens_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "blog_posts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "slug" character varying(255),
        "status" "public"."post_status" NOT NULL DEFAULT 'draft',
        "excerpt" character varying(500),
        "content" text NOT NULL,
        "content_format" character varying(20) NOT NULL DEFAULT 'markdown',
        "author_id" uuid,
        "featured_image" jsonb,
        "is_featured" boolean NOT NULL DEFAULT false,
        "views" integer NOT NULL DEFAULT 0,
        "categories" text[] NOT NULL DEFAULT '{}',
        "tags" text[] NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_blog_posts_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blog_posts_slug" UNIQUE ("slug"),
        CONSTRAINT "CHK_blog_posts_content_format" CHECK ("content_format" IN ('markdown', 'html'))
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_oauth_provider_providerId" ON "oauth_accounts" ("provider", "providerId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_blog_posts_status_created_at" ON "blog_posts" ("status", "created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_blog_posts_featured_created_at" ON "blog_posts" ("is_featured", "created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_blog_posts_views" ON "blog_posts" ("views" DESC)`,
    );

    await queryRunner.query(`
      ALTER TABLE "refresh_tokens"
      ADD CONSTRAINT "FK_refresh_tokens_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "magic_link_tokens"
      ADD CONSTRAINT "FK_magic_link_tokens_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "oauth_accounts"
      ADD CONSTRAINT "FK_oauth_accounts_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "password_reset_tokens"
      ADD CONSTRAINT "FK_password_reset_tokens_user"
      FOREIGN KEY ("userId") REFERENCES "users"("id")
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "password_reset_tokens" DROP CONSTRAINT "FK_password_reset_tokens_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "oauth_accounts" DROP CONSTRAINT "FK_oauth_accounts_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "magic_link_tokens" DROP CONSTRAINT "FK_magic_link_tokens_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_user"`,
    );

    await queryRunner.query(`DROP INDEX "IDX_oauth_provider_providerId"`);
    await queryRunner.query(`DROP INDEX "idx_blog_posts_views"`);
    await queryRunner.query(`DROP INDEX "idx_blog_posts_featured_created_at"`);
    await queryRunner.query(`DROP INDEX "idx_blog_posts_status_created_at"`);
    await queryRunner.query(`DROP TABLE "blog_posts"`);
    await queryRunner.query(`DROP TABLE "oauth_accounts"`);
    await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
    await queryRunner.query(`DROP TABLE "magic_link_tokens"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."post_status"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
