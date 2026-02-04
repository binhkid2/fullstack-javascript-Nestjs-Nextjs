'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

const statusOptions = ['draft', 'published', 'archived'] as const;
const formatOptions = ['markdown', 'html'] as const;

type PostStatus = (typeof statusOptions)[number];
type ContentFormat = (typeof formatOptions)[number];

type BlogPost = {
  id: string;
  title: string;
  slug?: string | null;
  status: PostStatus;
  excerpt?: string | null;
  content: string;
  contentFormat: ContentFormat;
  authorId?: string | null;
  author?: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
};

type BlogPostDraft = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentFormat: ContentFormat;
  status?: PostStatus;
};

const emptyDraft = (): BlogPostDraft => ({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  contentFormat: 'markdown',
});

type Props = {
  userEmail: string;
  userRole: string;
};

export default function DashboardClient({ userEmail, userRole }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<BlogPostDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<BlogPostDraft>(emptyDraft);

  const canCreate = userRole === 'ADMIN' || userRole === 'MANAGER';
  const canEdit = userRole === 'ADMIN';
  const canDelete = userRole === 'ADMIN';

  const sortedPosts = useMemo(() => posts, [posts]);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/blog-posts');
      if (!response.ok) {
        throw new Error('Failed');
      }
      const data = (await response.json()) as BlogPost[];
      setPosts(data ?? []);
    } catch {
      const message = 'Unable to load blog posts.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          slug: draft.slug || undefined,
          excerpt: draft.excerpt || undefined,
          content: draft.content,
          contentFormat: draft.contentFormat,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed');
      }

      const created = (await response.json()) as BlogPost;
      setPosts((prev) => [created, ...prev]);
      setDraft(emptyDraft());
      toast.success('Draft created.');
    } catch {
      const message = 'Unable to create blog post.';
      toast.error(message);
    }
  };

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setEditingDraft({
      title: post.title,
      slug: post.slug ?? '',
      excerpt: post.excerpt ?? '',
      content: post.content,
      contentFormat: post.contentFormat ?? 'markdown',
      status: post.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingDraft(emptyDraft());
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;

    try {
      const response = await fetch(`/api/blog-posts/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingDraft.title,
          slug: editingDraft.slug || null,
          excerpt: editingDraft.excerpt || null,
          content: editingDraft.content,
          contentFormat: editingDraft.contentFormat,
          status: editingDraft.status,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed');
      }

      const updated = (await response.json()) as BlogPost;
      setPosts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      cancelEdit();
      toast.success('Blog post updated.');
    } catch {
      const message = 'Unable to update blog post.';
      toast.error(message);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this blog post? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog-posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed');
      }

      setPosts((prev) => prev.filter((item) => item.id !== postId));
      toast.success('Blog post deleted.');
    } catch {
      const message = 'Unable to delete blog post.';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Profile</p>
        <h2 className="mt-3 text-2xl font-semibold text-gray-900">
          Welcome back
        </h2>
        <p className="mt-3 text-gray-600">
          You are signed in as <span className="font-medium">{userEmail}</span>.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Role: <span className="font-semibold text-gray-700">{userRole}</span>
        </p>
      </div>

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
            onClick={loadPosts}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-gray-500">Loading posts...</p>
        ) : null}

        {error ? (
          <p className="mt-6 text-sm text-red-600">{error}</p>
        ) : null}

        {!loading && !error && sortedPosts.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500">No posts yet.</p>
        ) : null}

        {!loading && sortedPosts.length > 0 ? (
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
                {sortedPosts.map((post) => (
                  <tr key={post.id} className="border-b border-gray-100">
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-gray-900">{post.title}</p>
                      {post.excerpt ? (
                        <p className="mt-1 text-xs text-gray-500">{post.excerpt}</p>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4 capitalize">{post.status}</td>
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
                            onClick={() => startEdit(post)}
                            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                          >
                            Edit
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id)}
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

      {canCreate ? (
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
            {editingId ? 'Edit post' : 'New post'}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-gray-900">
            {editingId ? 'Update blog post' : 'Create a new draft'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {editingId
              ? 'Admins can update status and content.'
              : 'New posts start in draft status by default.'}
          </p>

          <form
            onSubmit={editingId ? handleUpdate : handleCreate}
            className="mt-6 space-y-4"
          >
            <label className="block text-sm font-medium text-gray-700">
              Title
              <input
                type="text"
                required
                value={editingId ? editingDraft.title : draft.title}
                onChange={(event) =>
                  editingId
                    ? setEditingDraft((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    : setDraft((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Slug
              <input
                type="text"
                value={editingId ? editingDraft.slug : draft.slug}
                onChange={(event) =>
                  editingId
                    ? setEditingDraft((prev) => ({
                        ...prev,
                        slug: event.target.value,
                      }))
                    : setDraft((prev) => ({
                        ...prev,
                        slug: event.target.value,
                      }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Excerpt
              <input
                type="text"
                value={editingId ? editingDraft.excerpt : draft.excerpt}
                onChange={(event) =>
                  editingId
                    ? setEditingDraft((prev) => ({
                        ...prev,
                        excerpt: event.target.value,
                      }))
                    : setDraft((prev) => ({
                        ...prev,
                        excerpt: event.target.value,
                      }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
              />
            </label>

            <label className="block text-sm font-medium text-gray-700">
              Content
              <textarea
                rows={6}
                required
                value={editingId ? editingDraft.content : draft.content}
                onChange={(event) =>
                  editingId
                    ? setEditingDraft((prev) => ({
                        ...prev,
                        content: event.target.value,
                      }))
                    : setDraft((prev) => ({
                        ...prev,
                        content: event.target.value,
                      }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Content format
                <select
                  value={editingId ? editingDraft.contentFormat : draft.contentFormat}
                  onChange={(event) =>
                    editingId
                      ? setEditingDraft((prev) => ({
                          ...prev,
                          contentFormat: event.target.value as ContentFormat,
                        }))
                      : setDraft((prev) => ({
                          ...prev,
                          contentFormat: event.target.value as ContentFormat,
                        }))
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
                >
                  {formatOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              {canEdit && editingId ? (
                <label className="block text-sm font-medium text-gray-700">
                  Status
                  <select
                    value={(editingId ? editingDraft.status : draft.status) ?? 'draft'}
                    onChange={(event) =>
                      editingId
                        ? setEditingDraft((prev) => ({
                            ...prev,
                            status: event.target.value as PostStatus,
                          }))
                        : setDraft((prev) => ({
                            ...prev,
                            status: event.target.value as PostStatus,
                          }))
                    }
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                {editingId ? 'Save changes' : 'Create draft'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
