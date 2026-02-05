'use client';

import { toast } from 'react-toastify';

const statusOptions = ['draft', 'published', 'archived'] as const;

type PostStatus = (typeof statusOptions)[number];

type BlogPost = {
  id: string;
  title: string;
  status: PostStatus;
  excerpt?: string | null;
  authorId?: string | null;
  author?: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
  updatedAt: string;
};

type Props = {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  canEdit: boolean;
  canDelete: boolean;
  updatingStatusId: string | null;
  onEdit: (post: BlogPost) => void;
  onDelete: (postId: string) => void;
  onStatusChange: (postId: string, nextStatus: PostStatus) => void;
  onRefresh: () => void;
};

export default function BlogPostsTable({
  posts,
  loading,
  error,
  canEdit,
  canDelete,
  updatingStatusId,
  onEdit,
  onDelete,
  onStatusChange,
  onRefresh,
}: Props) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Blog posts</p>
          <h2 className="mt-3 text-2xl font-semibold text-gray-900">
            Latest posts
          </h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {loading ? <p className="mt-6 text-sm text-gray-500">Loading posts...</p> : null}
      {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

      {!loading && !error && posts.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No posts yet.</p>
      ) : null}

      {!loading && posts.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-3 pr-4">Title</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Updated</th>
                <th className="pb-3 pr-4">Author</th>
                <th className="pb-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-100">
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-gray-900">{post.title}</p>
                    {post.excerpt ? (
                      <p className="mt-1 text-xs text-gray-500">{post.excerpt}</p>
                    ) : null}
                  </td>
                  <td className="py-4 pr-4">
                    {canEdit ? (
                      <select
                        value={post.status}
                        onChange={(event) =>
                          onStatusChange(post.id, event.target.value as PostStatus)
                        }
                        disabled={updatingStatusId === post.id}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-semibold capitalize text-gray-700"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="capitalize">{post.status}</span>
                    )}
                  </td>
                  <td className="py-4 pr-4 text-xs text-gray-500">
                    {new Date(post.updatedAt).toLocaleString()}
                  </td>
                  <td className="py-4 pr-4 text-xs text-gray-500">
                    {post.author?.email ?? post.authorId ?? '—'}
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => onEdit(post)}
                          className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          Edit
                        </button>
                      ) : null}
                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm('Delete this blog post? This cannot be undone.')
                            ) {
                              onDelete(post.id);
                            }
                          }}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
