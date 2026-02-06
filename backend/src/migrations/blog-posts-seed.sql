-- Seed 1 user and 11 published blog posts (markdown)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

WITH seed_user AS (
  INSERT INTO "users" ("id", "email", "name", "role", "isActive", "createdAt", "updatedAt")
  VALUES (
    uuid_generate_v4(),
    'writer@ducbinh.blog',
    'Duc Binh',
    'MEMBER',
    true,
    now(),
    now()
  )
  ON CONFLICT ("email") DO UPDATE
    SET "name" = EXCLUDED."name",
        "role" = EXCLUDED."role",
        "isActive" = EXCLUDED."isActive",
        "updatedAt" = now()
  RETURNING "id"
),
posts AS (
  SELECT
    uuid_generate_v4() AS id,
    'Ship a Next.js Landing Page Without Slowing It Down' AS title,
    'ship-nextjs-landing-page' AS slug,
    'published'::post_status AS status,
    'A quick checklist for building a fast marketing page without losing design polish.' AS excerpt,
    $$# Ship a Next.js Landing Page

Keep the hero light and the above-the-fold HTML small.

## Checklist
- Use server rendering for content
- Avoid heavy client bundles
- Compress hero images

Short pages can still be fast and beautiful.$$ AS content,
    'markdown' AS content_format,
    (SELECT "id" FROM seed_user) AS author_id,
    '{"id":"img-landing","url":"https://images.unsplash.com/photo-1527443224154-c4a3942d3acf","alt":"Landing page"}'::jsonb AS featured_image,
    true AS is_featured,
    184 AS views,
    ARRAY['frontend', 'performance'] AS categories,
    ARRAY['nextjs', 'webperf', 'ui'] AS tags,
    now() - interval '14 days' AS created_at,
    now() - interval '3 days' AS updated_at

  UNION ALL
  SELECT
    uuid_generate_v4(),
    'CSS Grid Patterns for Content-Heavy Blogs',
    'css-grid-patterns-for-blogs',
    'published'::post_status,
    'Three grid layouts that keep cards readable and breathable.',
    $$# CSS Grid Patterns

Grid makes large content lists feel organized.

## Patterns
- Masonry-style cards
- Two-column editorial
- Split layout with sidebar

Keep gaps consistent and cards readable.$$,
    'markdown',
    (SELECT "id" FROM seed_user),
    '{"id":"img-grid","url":"https://images.unsplash.com/photo-1489515217757-5fd1be406fef","alt":"Grid layout"}'::jsonb,
    true,
    139,
    ARRAY['frontend', 'design'],
    ARRAY['css', 'layout', 'grid'],
    now() - interval '13 days',
    now() - interval '4 days'

  UNION ALL
  SELECT
    uuid_generate_v4(),
    'API Pagination That Feels Good',
    'api-pagination-that-feels-good',
    'published'::post_status,
    'A pragmatic recipe for stable pagination and friendly UX.',
    $$# API Pagination

Use stable sorting and return total counts.

## Tips
- Default to newest
- Clamp page sizes
- Provide next/prev hints

Your UI will feel faster with predictable pages.$$,
    'markdown',
    (SELECT "id" FROM seed_user),
    NULL,
    false,
    97,
    ARRAY['backend', 'api'],
    ARRAY['pagination', 'rest'],
    now() - interval '12 days',
    now() - interval '6 days'

  UNION ALL
  SELECT
    uuid_generate_v4(),
    'Designing a Simple Author Model',
    'designing-a-simple-author-model',
    'published'::post_status,
    'Keep your author model minimal and your UI flexible.',
    $$# Author Model

Start with name and email.

## Why it works
- Clean UI labels
- Easy filtering
- Simple joins

Add more fields only if you need them.$$,
    'markdown',
    (SELECT "id" FROM seed_user),
    NULL,
    false,
    82,
    ARRAY['backend', 'data'],
    ARRAY['schema', 'users'],
    now() - interval '11 days',
    now() - interval '7 days'

  UNION ALL
  SELECT
    uuid_generate_v4(),
    'A Tiny Guide to Markdown Content',
    'tiny-guide-to-markdown-content',
    'published'::post_status,
    'Keep Markdown short, structured, and easy to scan.',
    $$# Markdown Content

Short paragraphs win.

## Structure
- H2 for sections
- Lists for steps
- Bold for key terms

Readers scan before they commit.$$,
    'markdown',
    (SELECT "id" FROM seed_user),
    NULL,
    false,
    74,
    ARRAY['content'],
    ARRAY['markdown', 'writing'],
    now() - interval '10 days',
    now() - interval '8 days'

  UNION ALL
  SELECT
    uuid_generate_v4(),
    'Using Tags Without Tag Chaos',
    'using-tags-without-tag-chaos',
    'published'::post_status,
    'Tags are great when you cap, group, and normalize them.',
    $$# Tag Strategy

Tags should help navigation, not confuse it.

## Rules
- Limit to 3-5 tags
- Use lowercase
- Avoid duplicates

Good tags make search feel smart.$$,
    'markdown',
    (SELECT "id" FROM seed_user),
    NULL,
    false,
    65,
    ARRAY['content', 'product'],
    ARRAY['tags', 'taxonomy'],
    now() - interval '9 days',
    now() - interval '6 days'

  UNION ALL
  SELECT
    uuid_generate_v4(),
    'Fast Filters on Large Lists',
    'fast-filters-on-large-lists',
    'published'::post_status,
    'Keep filter UI snappy with server-side queries.',
    $$# Fast Filters

Server-side filters keep payloads small.

## Notes
- Index tags and categories
- Use ILIKE for search
- Cache popular queries

It stays fast even with lots of posts.$$,
    'markdown',
    (SELECT "id" FROM seed_user),
    NULL,
    false,
    120,
    ARRAY['backend', 'performance'],
    ARRAY['filters', 'sql'],
    now() - interval '8 days',
    now() - interval '5 days'

  UNION ALL
  SELECT
    uuid_generate_v4(),
    'Crafting a Featured Section',
    'crafting-a-featured-section',
    'published'::post_status,
    'Use one hero and a few supporting picks to avoid clutter.',
    $$# Featured Section

A single hero story anchors the page.

## Layout
- One large card
- 2-3 supporting cards
- Clear CTA

Featured should feel curated, not random.$$,
    'markdown',
    (SELECT "id" FROM seed_user),
    '{"id":"img-feature","url":"https://images.unsplash.com/photo-1498050108023-c5249f4df085","alt":"Featured post"}'::jsonb,
    true,
    156,
    ARRAY['frontend', 'ux'],
    ARRAY['layout', 'featured'],
    now() - interval '7 days',
    now() - interval '3 days'

  UNION ALL
  SELECT
    uuid_generate_v4(),
    'SEO Basics for Engineering Blogs',
    'seo-basics-for-engineering-blogs',
    'published'::post_status,
    'Titles, descriptions, and clean slugs do most of the work.',
    $$# SEO Basics

Start with the basics before advanced tooling.

## Must-haves
- Clean slugs
- Strong titles
- Meta descriptions

That alone boosts discoverability.$$,
    'markdown',
    (SELECT "id" FROM seed_user),
    NULL,
    false,
    88,
    ARRAY['marketing', 'content'],
    ARRAY['seo', 'metadata'],
    now() - interval '6 days',
    now() - interval '2 days'

  UNION ALL
  SELECT
    uuid_generate_v4(),
    'Keeping Drafts Safe',
    'keeping-drafts-safe',
    'published'::post_status,
    'Why draft status should never leak into public listings.',
    $$# Draft Safety

Always filter by status = published.

## Guardrails
- Enforce in queries
- Require slug
- Add tests

This prevents accidental leaks.$$,
    'markdown',
    (SELECT "id" FROM seed_user),
    NULL,
    false,
    52,
    ARRAY['backend', 'security'],
    ARRAY['rbac', 'status'],
    now() - interval '5 days',
    now() - interval '2 days'

  UNION ALL
  SELECT
    uuid_generate_v4(),
    'Measuring Views the Simple Way',
    'measuring-views-the-simple-way',
    'published'::post_status,
    'Incrementing view counts on read without overengineering.',
    $$# View Counts

A single increment endpoint is enough.

## Keep it clean
- Update by slug
- Clamp to published
- No cookies needed

Good enough for most blogs.$$,
    'markdown',
    (SELECT "id" FROM seed_user),
    '{"id":"img-views","url":"https://images.unsplash.com/photo-1553877522-43269d4ea984","alt":"Analytics"}'::jsonb,
    false,
    111,
    ARRAY['analytics', 'backend'],
    ARRAY['views', 'metrics'],
    now() - interval '4 days',
    now() - interval '1 day'

  UNION ALL
  SELECT
    uuid_generate_v4(),
    'A Minimal Newsletter Flow',
    'a-minimal-newsletter-flow',
    'published'::post_status,
    'Capture emails with a single field and a calm promise.',
    $$# Newsletter Flow

Keep it short and trust-building.

## Copy ideas
- Weekly digest only
- No spam
- Unsubscribe anytime

A simple promise gets more signups.$$,
    'markdown',
    (SELECT "id" FROM seed_user),
    NULL,
    false,
    58,
    ARRAY['product', 'marketing'],
    ARRAY['newsletter', 'growth'],
    now() - interval '3 days',
    now() - interval '1 day'
)
INSERT INTO "blog_posts" (
  "id",
  "title",
  "slug",
  "status",
  "excerpt",
  "content",
  "content_format",
  "author_id",
  "featured_image",
  "is_featured",
  "views",
  "categories",
  "tags",
  "created_at",
  "updated_at"
)
SELECT
  id,
  title,
  slug,
  status,
  excerpt,
  content,
  content_format,
  author_id,
  featured_image,
  is_featured,
  views,
  categories,
  tags,
  created_at,
  updated_at
FROM posts
ON CONFLICT ("slug") DO UPDATE
SET
  "title" = EXCLUDED."title",
  "excerpt" = EXCLUDED."excerpt",
  "content" = EXCLUDED."content",
  "content_format" = EXCLUDED."content_format",
  "status" = EXCLUDED."status",
  "author_id" = EXCLUDED."author_id",
  "featured_image" = EXCLUDED."featured_image",
  "is_featured" = EXCLUDED."is_featured",
  "views" = EXCLUDED."views",
  "categories" = EXCLUDED."categories",
  "tags" = EXCLUDED."tags",
  "created_at" = EXCLUDED."created_at",
  "updated_at" = EXCLUDED."updated_at";
