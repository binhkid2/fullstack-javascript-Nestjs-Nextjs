import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

async function getPost(slug: string): Promise<any> {
  console.log("[v0] Fetching blog post with slug:", slug);
  const apiUrl =
    process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  const url = `${apiUrl}/blog-posts/public/${slug}`;
  try {
    const response = await fetch(url, {
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }

    const post = await response.json();
    return post;
  } catch (error: any) {
    return null;
  }
}

export default async function BlogDetailPage({ params }: { params: any }) {
  const resolvedParams = await params;
  console.log("[v0] Resolved params:", resolvedParams);

  const post = await getPost(resolvedParams.slug);

  if (!post) {
    return (
      <main className="min-h-screen px-6 py-16">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-xl">
          <h1 className="text-3xl font-semibold text-gray-900">Not found</h1>
          <p className="mt-3 text-gray-600">
            This blog post does not exist or is not published.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <article className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Blog</p>
        <h1 className="mt-4 text-4xl font-semibold text-gray-900">
          {post.title}
        </h1>
        {post.excerpt ? (
          <p className="mt-4 text-lg text-gray-600">{post.excerpt}</p>
        ) : null}
        {post.publishedAt ? (
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-gray-400">
            Published {new Date(post.publishedAt).toLocaleDateString()}
          </p>
        ) : null}

        <div className="mt-8 text-gray-700">
          {post.contentFormat === "html" ? (
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <div className="prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
