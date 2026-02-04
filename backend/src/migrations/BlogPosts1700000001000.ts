import { MigrationInterface, QueryRunner } from 'typeorm';

export class BlogPosts1700000001000 implements MigrationInterface {
  name = 'BlogPosts1700000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."post_status" AS ENUM ('draft', 'published', 'archived')`,
    );

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
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "published_at" TIMESTAMPTZ,
        CONSTRAINT "PK_blog_posts_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_blog_posts_slug" UNIQUE ("slug"),
        CONSTRAINT "CHK_blog_posts_content_format" CHECK ("content_format" IN ('markdown', 'html')),
        CONSTRAINT "CHK_blog_posts_published_at_required" CHECK ("status" <> 'published' OR "published_at" IS NOT NULL)
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_blog_posts_status_created_at" ON "blog_posts" ("status", "created_at" DESC)`,
    );

    await queryRunner.query(
      `CREATE INDEX "idx_blog_posts_published_at" ON "blog_posts" ("published_at" DESC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_blog_posts_published_at"`);
    await queryRunner.query(`DROP INDEX "idx_blog_posts_status_created_at"`);
    await queryRunner.query(`DROP TABLE "blog_posts"`);
    await queryRunner.query(`DROP TYPE "public"."post_status"`);
  }
}
