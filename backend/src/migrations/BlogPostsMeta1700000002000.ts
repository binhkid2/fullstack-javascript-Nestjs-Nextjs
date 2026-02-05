import { MigrationInterface, QueryRunner } from 'typeorm';

export class BlogPostsMeta1700000002000 implements MigrationInterface {
  name = 'BlogPostsMeta1700000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "featured_image" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "categories" text[] NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "tags" text[] NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "tags"`);
    await queryRunner.query(
      `ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "categories"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_posts" DROP COLUMN IF EXISTS "featured_image"`,
    );
  }
}
