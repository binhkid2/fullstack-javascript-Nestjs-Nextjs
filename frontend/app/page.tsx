import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { Fraunces, Space_Grotesk } from 'next/font/google';
import { authOptions } from '@/auth';

export const dynamic = 'force-dynamic';

const headingFont = Fraunces({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

const bodyFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

type BlogPost = {
  id: string;
  title: string;
  slug?: string | null;
  excerpt?: string | null;
  featuredImage?: {
    id: string;
    url: string;
    alt?: string | null;
  } | null;
  authorId?: string | null;
  author?: {
    name?: string | null;
    email?: string | null;
  } | null;
  createdAt?: string;
  views?: number;
  categories?: string[];
  tags?: string[];
};

type PublicPostsResponse = {
  items: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const numberFormatter = new Intl.NumberFormat('en-US');

const formatDate = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
};

const formatViews = (value?: number) => numberFormatter.format(Math.max(0, value ?? 0));

const normalizeList = (value?: string) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const buildTaxonomy = (posts: BlogPost[]) => {
  const categoryCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  posts.forEach((post) => {
    post.categories?.forEach((category) => {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    });
    post.tags?.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    });
  });

  const toSortedList = (map: Map<string, number>) =>
    [...map.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

  return {
    categories: toSortedList(categoryCounts),
    tags: toSortedList(tagCounts),
  };
};

async function getPublishedPosts(query: {
  page: number;
  pageSize: number;
  q?: string;
  tags?: string;
  category?: string;
  sort?: string;
}): Promise<PublicPostsResponse> {
  const apiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return { items: [], total: 0, page: query.page, pageSize: query.pageSize };
  }

  try {
    const params = new URLSearchParams({
      page: String(query.page),
      pageSize: String(query.pageSize),
    });
    if (query.q) params.set('q', query.q);
    if (query.tags) params.set('tags', query.tags);
    if (query.category) params.set('category', query.category);
    if (query.sort) params.set('sort', query.sort);

    const response = await fetch(`${apiUrl}/blog-posts/public?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      return { items: [], total: 0, page: query.page, pageSize: query.pageSize };
    }
    return response.json();
  } catch {
    return { items: [], total: 0, page: query.page, pageSize: query.pageSize };
  }
}

async function getFeaturedPosts(): Promise<BlogPost[]> {
  const apiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];

  try {
    const response = await fetch(`${apiUrl}/blog-posts/public/featured?limit=6`, {
      cache: 'no-store',
    });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

async function getPopularPosts(): Promise<BlogPost[]> {
  const apiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];

  try {
    const params = new URLSearchParams({
      page: '1',
      pageSize: '5',
      sort: 'most_viewed',
    });
    const response = await fetch(`${apiUrl}/blog-posts/public?${params.toString()}`, {
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const data: PublicPostsResponse = await response.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;

  const page = parseInt(
    typeof resolvedParams.page === 'string' ? resolvedParams.page : '1',
    10,
  );
  const pageSize = parseInt(
    typeof resolvedParams.pageSize === 'string' ? resolvedParams.pageSize : '8',
    10,
  );
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
  const tags = typeof resolvedParams.tags === 'string' ? resolvedParams.tags : '';
  const category =
    typeof resolvedParams.category === 'string' ? resolvedParams.category : '';
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : 'newest';

  const [session, featuredPosts, postsResponse, popularPosts] = await Promise.all([
    getServerSession(authOptions),
    getFeaturedPosts(),
    getPublishedPosts({
      page: Number.isNaN(page) ? 1 : Math.max(1, page),
      pageSize: Number.isNaN(pageSize) ? 8 : Math.min(50, pageSize),
      q: q || undefined,
      tags: tags || undefined,
      category: category || undefined,
      sort,
    }),
    getPopularPosts(),
  ]);

  const activeTags = normalizeList(tags);
  const activeCategories = normalizeList(category);

  const { categories, tags: tagList } = buildTaxonomy([
    ...featuredPosts,
    ...postsResponse.items,
    ...popularPosts,
  ]);

  const topCategories = categories.slice(0, 7);
  const topTags = tagList.slice(0, 12);

  const featuredPrimary = featuredPosts[0];
  const featuredSecondary = featuredPosts.slice(1, 4);

  const totalPages = Math.max(1, Math.ceil(postsResponse.total / postsResponse.pageSize));

  const buildHref = (overrides: Partial<Record<string, string | undefined>>) => {
    const params = new URLSearchParams();

    const base: Record<string, string | undefined> = {
      page: String(postsResponse.page),
      pageSize: String(postsResponse.pageSize),
      q,
      tags,
      category,
      sort,
    };

    Object.entries(base).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    Object.entries(overrides).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    return `/?${params.toString()}`;
  };

  const toggleTagHref = (tag: string) => {
    const nextTags = activeTags.includes(tag)
      ? activeTags.filter((item) => item !== tag)
      : [...activeTags, tag];
    return buildHref({ tags: nextTags.join(','), page: '1' });
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((pageNumber) =>
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - postsResponse.page) <= 1,
    )
    .slice(0, 5);

  return (
    <main
      className={`${bodyFont.className} relative min-h-screen overflow-hidden bg-[#f7f2ea] text-slate-900`}
    >
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_top,_#fbd6b9_0%,_rgba(251,214,185,0.15)_55%,_transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-32 left-[-10%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_#c8d5ff_0%,_rgba(200,213,255,0.25)_45%,_transparent_70%)]" />

      <header className="mx-auto max-w-6xl px-6 pt-10">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow">
                <img
                  src="https://logos-world.net/wp-content/uploads/2021/08/Blogger-Logo-2010-2013.png"
                  alt="Blogger logo"
                  className="h-8 w-8"
                />
              </span>
              <div>
                <p className={`${headingFont.className} text-2xl font-semibold`}>
                  Duc Binh&apos;s blog
                </p>
                <p className="text-sm text-slate-500">Nestjs + Next.js blogs app</p>
              </div>
            </Link>

            <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
              <form action="/" method="get" className="flex min-w-[220px] flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm sm:min-w-[280px]">
                <input
                  name="q"
                  placeholder="Search title or excerpt"
                  defaultValue={q}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                />
                <input type="hidden" name="tags" value={tags} />
                <input type="hidden" name="category" value={category} />
                <input type="hidden" name="sort" value={sort} />
                <input type="hidden" name="pageSize" value={postsResponse.pageSize} />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                >
                  Search
                </button>
              </form>

              {session ? (
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href={buildHref({ category: undefined, page: '1' })}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                activeCategories.length === 0
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:text-slate-900'
              }`}
            >
              All topics
            </Link>
            {topCategories.map((item) => (
              <Link
                key={item.label}
                href={buildHref({ category: item.label, page: '1' })}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  activeCategories.includes(item.label)
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto mt-10 max-w-6xl px-6">
        <div className="flex flex-col gap-8 rounded-3xl bg-[#111827] p-8 text-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Featured</p>
              <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold`}>
                Spotlight stories
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/70">
                Curated picks from the latest engineering notes, product releases, and build logs.
              </p>
            </div>
            <div className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70">
              {featuredPosts.length} posts
            </div>
          </div>

          {featuredPosts.length === 0 ? (
            <p className="text-sm text-white/60">No featured posts yet.</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              {featuredPrimary ? (
                <Link
                  href={`/blog/${featuredPrimary.slug}`}
                  className="group relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  {featuredPrimary.featuredImage?.url ? (
                    <img
                      src={featuredPrimary.featuredImage.url}
                      alt={featuredPrimary.featuredImage.alt ?? featuredPrimary.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-30 transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="relative z-10">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                      Featured read
                    </p>
                    <h3 className={`${headingFont.className} mt-3 text-3xl font-semibold`}>
                      {featuredPrimary.title}
                    </h3>
                    <p className="mt-4 max-w-xl text-sm text-white/75">
                      {featuredPrimary.excerpt ?? 'Read the full story.'}
                    </p>
                  </div>
                  <div className="relative z-10 mt-6 flex flex-wrap items-center gap-4 text-xs text-white/70">
                    <span>{formatDate(featuredPrimary.createdAt)}</span>
                    <span>{formatViews(featuredPrimary.views)} views</span>
                  </div>
                </Link>
              ) : null}

              <div className="flex flex-col gap-4">
                {featuredSecondary.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10">
                      {post.featuredImage?.url ? (
                        <img
                          src={post.featuredImage.url}
                          alt={post.featuredImage.alt ?? post.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/60">Featured</p>
                      <h4 className="mt-2 text-sm font-semibold text-white">{post.title}</h4>
                      <p className="mt-1 text-xs text-white/70">
                        {formatDate(post.createdAt)} • {formatViews(post.views)} views
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl px-6 pb-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Library</p>
                <h2 className={`${headingFont.className} mt-3 text-3xl font-semibold`}>
                  All blog posts
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {postsResponse.total} posts • Page {postsResponse.page} of {totalPages}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildHref({ sort: 'newest', page: '1' })}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                    sort === 'newest' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  Newest
                </Link>
                <Link
                  href={buildHref({ sort: 'most_viewed', page: '1' })}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                    sort === 'most_viewed' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  Most viewed
                </Link>
                <Link
                  href={buildHref({ sort: 'featured', page: '1' })}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                    sort === 'featured' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'
                  }`}
                >
                  Featured
                </Link>
              </div>
            </div>

            <form
              action="/"
              method="get"
              className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3"
            >
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tags
                <input
                  name="tags"
                  defaultValue={tags}
                  placeholder="ai, backend"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Categories
                <input
                  name="category"
                  defaultValue={category}
                  placeholder="tech, news"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sort by
                <select
                  name="sort"
                  defaultValue={sort}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="most_viewed">Most viewed</option>
                  <option value="featured">Featured</option>
                </select>
              </label>
              <input type="hidden" name="q" value={q} />
              <input type="hidden" name="pageSize" value={postsResponse.pageSize} />
              <button
                type="submit"
                className="md:col-span-3 inline-flex w-fit items-center justify-center rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white"
              >
                Apply filters
              </button>
            </form>

            {topTags.length > 0 ? (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Browse tags
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {topTags.map((tag) => (
                    <Link
                      key={tag.label}
                      href={toggleTagHref(tag.label)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        activeTags.includes(tag.label)
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600'
                      }`}
                    >
                      #{tag.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            {postsResponse.items.length === 0 ? (
              <p className="mt-8 text-sm text-slate-500">No published posts found.</p>
            ) : (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {postsResponse.items.map((post) => {
                  const authorLabel =
                    post.author?.name ??
                    post.author?.email ??
                    (post.authorId ? `Author ${post.authorId.slice(0, 6)}` : 'Staff');

                  return (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      {post.featuredImage?.url ? (
                        <div className="relative h-44 overflow-hidden">
                          <img
                            src={post.featuredImage.url}
                            alt={post.featuredImage.alt ?? post.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                      ) : null}
                      <div className="flex h-full flex-col gap-3 p-5">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>{authorLabel}</span>
                          <span>•</span>
                          <span>{formatDate(post.createdAt)}</span>
                          <span>•</span>
                          <span>{formatViews(post.views)} views</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {post.title}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {post.excerpt ?? 'Read the full story.'}
                        </p>
                        <div className="mt-auto flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                          {post.categories?.slice(0, 2).map((item) => (
                            <span
                              key={item}
                              className="rounded-full bg-slate-100 px-3 py-1"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
              <Link
                href={buildHref({ page: String(Math.max(1, postsResponse.page - 1)) })}
                className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                  postsResponse.page <= 1
                    ? 'pointer-events-none bg-slate-100 text-slate-400'
                    : 'bg-slate-900 text-white'
                }`}
              >
                Previous
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                {pageNumbers.map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={buildHref({ page: String(pageNumber) })}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      pageNumber === postsResponse.page
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {pageNumber}
                  </Link>
                ))}
              </div>

              <Link
                href={buildHref({ page: String(Math.min(totalPages, postsResponse.page + 1)) })}
                className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                  postsResponse.page >= totalPages
                    ? 'pointer-events-none bg-slate-100 text-slate-400'
                    : 'bg-slate-900 text-white'
                }`}
              >
                Next
              </Link>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Popular posts
              </p>
              <div className="mt-4 space-y-4">
                {popularPosts.length === 0 ? (
                  <p className="text-sm text-slate-500">No popular posts yet.</p>
                ) : (
                  popularPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="flex items-center gap-3"
                    >
                      <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                        {post.featuredImage?.url ? (
                          <img
                            src={post.featuredImage.url}
                            alt={post.featuredImage.alt ?? post.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{post.title}</p>
                        <p className="text-xs text-slate-500">
                          {formatViews(post.views)} views
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Newsletter
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Get a quick weekly recap of new releases, tutorials, and engineering notes.
              </p>
              <form className="mt-4 flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
                />
                <button
                  type="button"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white"
                >
                  Subscribe
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tags
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {topTags.length === 0 ? (
                  <p className="text-sm text-slate-500">No tags yet.</p>
                ) : (
                  topTags.map((tag) => (
                    <Link
                      key={tag.label}
                      href={toggleTagHref(tag.label)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        activeTags.includes(tag.label)
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tag.label}
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-6 text-center text-xs uppercase tracking-[0.3em] text-slate-400">
              Ads placement
            </div>
          </aside>
        </div>
      </section>

      <footer className="border-t border-white/60 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`${headingFont.className} text-xl font-semibold text-slate-900`}>
              Duc Binh&apos;s blog
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Notes on shipping full-stack apps, scaling APIs, and building better tooling.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <a href="mailto:hello@ducbinh.blog" className="hover:text-slate-900">
              Contact
            </a>
            <a href="https://github.com" className="hover:text-slate-900">
              GitHub
            </a>
            <a href="https://x.com" className="hover:text-slate-900">
              X / Twitter
            </a>
            <a href="https://www.linkedin.com" className="hover:text-slate-900">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
