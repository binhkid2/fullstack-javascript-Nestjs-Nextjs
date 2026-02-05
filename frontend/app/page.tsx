import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

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

async function getPublishedPosts(): Promise<BlogPost[]> {
  const apiUrl =
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return []; // avoid localhost fallback at build time

  try {
    const response = await fetch(`${apiUrl}/blog-posts/public`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}
export default async function Home() {
  const session = await getServerSession(authOptions);
  const posts = await getPublishedPosts();

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="rounded-3xl bg-white p-10 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
          Welcome
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-gray-900">
          Simple secure sign-in
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Use a magic link to access your account without passwords or friction.
        </p>
        <p className="mt-2 text-gray-600">
          We will send a one-time sign-in link straight to your inbox.
        </p>
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
                Blog
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-gray-900">
                Latest posts
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

          {posts.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">
              No published posts yet.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-gray-200 p-6 transition hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                >
                  {post.featuredImage?.url ? (
                    <div className="mb-4 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      <img
                        src={post.featuredImage.url}
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
