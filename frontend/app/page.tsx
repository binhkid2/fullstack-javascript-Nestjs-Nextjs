import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import LandingControls from './LandingControls';

export const dynamic = "force-dynamic";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: {
    id: string;
    url: string;
    alt?: string | null;
  } | null;
};

type PublicPostsResponse = {
  items: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
};

async function getPublishedPosts(query: {
  page: number;
  pageSize: number;
  q?: string;
  tags?: string;
  category?: string;
  sort?: string;
}): Promise<PublicPostsResponse> {
  const apiUrl =
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL;
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
      cache: "no-store",
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
  const apiUrl =
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];

  try {
    const response = await fetch(`${apiUrl}/blog-posts/public/featured?limit=6`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    return response.json();
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
  const session = await getServerSession(authOptions);
  const page = parseInt(
    typeof resolvedParams.page === 'string' ? resolvedParams.page : '1',
    10,
  );
  const pageSize = parseInt(
    typeof resolvedParams.pageSize === 'string' ? resolvedParams.pageSize : '12',
    10,
  );
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q : '';
  const tags = typeof resolvedParams.tags === 'string' ? resolvedParams.tags : '';
  const category =
    typeof resolvedParams.category === 'string' ? resolvedParams.category : '';
  const sort =
    typeof resolvedParams.sort === 'string' ? resolvedParams.sort : 'newest';

  const featuredPosts = await getFeaturedPosts();
  const postsResponse = await getPublishedPosts({
    page: Number.isNaN(page) ? 1 : Math.max(1, page),
    pageSize: Number.isNaN(pageSize) ? 12 : Math.min(50, pageSize),
    q: q || undefined,
    tags: tags || undefined,
    category: category || undefined,
    sort,
  });

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="rounded-3xl bg-white p-10 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
          Welcome
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-gray-900">
          This is full stack javascript project
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          It use nest js for backend,Next js for frontend
        </p>
        <ul className="space-y-3 text-sm text-gray-800">
<li className="flex items-center gap-2">🔐 <span>JWT sessions with refresh tokens</span></li>
<li className="flex items-center gap-2">🛡️ <span>RBAC: ADMIN · MANAGER · MEMBER</span></li>
<li className="flex items-center gap-2">📝 <span>Blog CRUD with strict permissions</span></li>
</ul>
        <div className="mt-8">
          <Link
            href="/auth"
            className="inline-flex items-center rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Get Started
          </Link>
        </div>
      </div>

        <section className="rounded-3xl bg-white p-10 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
                Featured
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-gray-900">
                Featured posts
              </h2>
            </div>
            {session ? null : (
              <Link
                href="/auth"
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Sign in
              </Link>
            )}
          </div>

          {featuredPosts.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">
              No featured posts yet.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-gray-200 p-6 transition hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                >
                  {post.featuredImage?.url ? (
                    <div className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      <img
                        src={post.featuredImage.url || "/placeholder.svg"}
                        alt={post.featuredImage.alt ?? post.title}
                        className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <h3 className="text-lg font-semibold text-gray-900 transition group-hover:text-black">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm text-gray-600">
                    {post.excerpt ?? 'Read the full story.'}
                  </p>
                  <span className="mt-auto pt-6 text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                    Read more
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-10 shadow-xl">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
              Blog
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-gray-900">
              Browse all posts
            </h2>
          </div>

          <LandingControls
            total={postsResponse.total}
            page={postsResponse.page}
            pageSize={postsResponse.pageSize}
            q={q}
            tags={tags}
            category={category}
            sort={sort}
          />

          {postsResponse.items.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">
              No published posts found.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {postsResponse.items.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-gray-200 p-6 transition hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                >
                  {post.featuredImage?.url ? (
                    <div className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      <img
                        src={post.featuredImage.url || "/placeholder.svg"}
                        alt={post.featuredImage.alt ?? post.title}
                        className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <h3 className="text-lg font-semibold text-gray-900 transition group-hover:text-black">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm text-gray-600">
                    {post.excerpt ?? 'Read the full story.'}
                  </p>
                  <span className="mt-auto pt-6 text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">
                    Read more
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
