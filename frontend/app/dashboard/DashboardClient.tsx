'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';

const statusOptions = ['draft', 'published', 'archived'] as const;
const formatOptions = ['markdown', 'html'] as const;

type PostStatus = (typeof statusOptions)[number];
type ContentFormat = (typeof formatOptions)[number];

const emptyDraft = () => ({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  contentFormat: 'markdown' as ContentFormat,
  featuredImageUrl: '',
  featuredImageAlt: '',
  // keep internally for edits (not shown in UI)
  featuredImageId: '',
  categories: '',
  tags: '',
});

type Props = {
  userEmail: string;
  userRole: string;
};

export default function DashboardClient({ userEmail, userRole }: Props) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<any>(emptyDraft);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const canCreate = userRole === 'ADMIN' || userRole === 'MANAGER';
  const canEdit = userRole === 'ADMIN';
  const canDelete = userRole === 'ADMIN';

  const sortedPosts = useMemo(() => posts, [posts]);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/blog-posts');
      if (!response.ok) throw new Error('Failed');
      const data = (await response.json()) as any[];
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

  const normalizeMeta = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  // ✅ Always use a random UUID for featuredImage.id on create.
  // ✅ On edit, reuse existing id if present; otherwise generate.
  // ✅ No UI field for featuredImageId.
  const buildFeaturedImage = (data: any) => {
    const url = (data.featuredImageUrl ?? '').trim();
    if (url.length === 0) return undefined;

    const existingId = (data.featuredImageId ?? '').trim();
    return {
      id: existingId || crypto.randomUUID(),
      url,
      alt: (data.featuredImageAlt ?? '').trim() || null,
    };
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const categories = normalizeMeta(draft.categories);
    const tags = normalizeMeta(draft.tags);

    // generate a new id (draft.featuredImageId is always empty on create)
    const featuredImage = buildFeaturedImage({ ...draft, featuredImageId: '' });

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
          featuredImage,
          categories,
          tags,
        }),
      });

      if (!response.ok) throw new Error('Failed');

      const created = (await response.json()) as any;
      setPosts((prev) => [created, ...prev]);
      setDraft(emptyDraft());
      toast.success('Draft created.');
    } catch {
      toast.error('Unable to create blog post.');
    }
  };

  const startEdit = (post: any) => {
    setEditingId(post.id);
    setEditingDraft({
      title: post.title,
      slug: post.slug ?? '',
      excerpt: post.excerpt ?? '',
      content: post.content,
      contentFormat: (post.contentFormat ?? 'markdown') as ContentFormat,
      status: post.status as PostStatus,
      featuredImageId: post.featuredImage?.id ?? '', // keep internally, not displayed
      featuredImageUrl: post.featuredImage?.url ?? '',
      featuredImageAlt: post.featuredImage?.alt ?? '',
      categories: post.categories?.join(', ') ?? '',
      tags: post.tags?.join(', ') ?? '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingDraft(emptyDraft());
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;

    const categories = normalizeMeta(editingDraft.categories);
    const tags = normalizeMeta(editingDraft.tags);

    // reuse existing featuredImageId if present; otherwise generate
    const featuredImage = buildFeaturedImage(editingDraft) ?? null;

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
          featuredImage,
          categories,
          tags,
        }),
      });

      if (!response.ok) throw new Error('Failed');

      const updated = (await response.json()) as any;
      setPosts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      cancelEdit();
      toast.success('Blog post updated.');
    } catch {
      toast.error('Unable to update blog post.');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this blog post? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/blog-posts/${postId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed');

      setPosts((prev) => prev.filter((item) => item.id !== postId));
      toast.success('Blog post deleted.');
    } catch {
      toast.error('Unable to delete blog post.');
    }
  };

  const handleStatusChange = async (postId: string, nextStatus: PostStatus) => {
    const current = posts.find((post) => post.id === postId);
    if (!current || current.status === nextStatus) return;

    const shouldProceed = confirm(`Change status from ${current.status} to ${nextStatus}?`);
    if (!shouldProceed) return;

    setUpdatingStatusId(postId);
    try {
      const payload: { status: PostStatus; publishedAt?: string } = { status: nextStatus };
      if (nextStatus === 'published') payload.publishedAt = new Date().toISOString();

      const response = await fetch(`/api/blog-posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed');

      const updated = (await response.json()) as any;
      setPosts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      toast.success('Status updated.');
    } catch {
      toast.error('Unable to update status.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Profile</p>
        <h2 className="mt-3 text-2xl font-semibold text-gray-900">Welcome back</h2>
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
            <h2 className="mt-3 text-2xl font-semibold text-gray-900">Latest posts</h2>
          </div>
          <button
            type="button"
            onClick={loadPosts}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {loading ? <p className="mt-6 text-sm text-gray-500">Loading posts...</p> : null}
        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}
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
                    <td className="py-4 pr-4">
                      {canEdit ? (
                        <select
                          value={post.status}
                          onChange={(event) =>
                            handleStatusChange(post.id, event.target.value as PostStatus)
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
            {editingId ? 'Admins can update status and content.' : 'New posts start in draft status by default.'}
          </p>

          <form onSubmit={editingId ? handleUpdate : handleCreate} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Title
              <input
                type="text"
                required
                value={editingId ? editingDraft.title : draft.title}
                onChange={(event) =>
                  editingId
                    ? setEditingDraft((prev: any) => ({ ...prev, title: event.target.value }))
                    : setDraft((prev: any) => ({ ...prev, title: event.target.value }))
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
                    ? setEditingDraft((prev: any) => ({ ...prev, slug: event.target.value }))
                    : setDraft((prev: any) => ({ ...prev, slug: event.target.value }))
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
                    ? setEditingDraft((prev: any) => ({ ...prev, excerpt: event.target.value }))
                    : setDraft((prev: any) => ({ ...prev, excerpt: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Featured image URL
                <input
                  type="url"
                  value={editingId ? editingDraft.featuredImageUrl : draft.featuredImageUrl}
                  onChange={(event) =>
                    editingId
                      ? setEditingDraft((prev: any) => ({
                          ...prev,
                          featuredImageUrl: event.target.value,
                          // if user adds an image for the first time while editing, ensure an id exists
                          featuredImageId: prev.featuredImageId || crypto.randomUUID(),
                        }))
                      : setDraft((prev: any) => ({ ...prev, featuredImageUrl: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Featured image alt
                <input
                  type="text"
                  value={editingId ? editingDraft.featuredImageAlt : draft.featuredImageAlt}
                  onChange={(event) =>
                    editingId
                      ? setEditingDraft((prev: any) => ({ ...prev, featuredImageAlt: event.target.value }))
                      : setDraft((prev: any) => ({ ...prev, featuredImageAlt: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
                />
              </label>
            </div>
 

            <label className="block text-sm font-medium text-gray-700">
              Content
              <textarea
                rows={6}
                required
                value={editingId ? editingDraft.content : draft.content}
                onChange={(event) =>
                  editingId
                    ? setEditingDraft((prev: any) => ({ ...prev, content: event.target.value }))
                    : setDraft((prev: any) => ({ ...prev, content: event.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Categories (comma separated)
                <input
                  type="text"
                  value={editingId ? editingDraft.categories : draft.categories}
                  onChange={(event) =>
                    editingId
                      ? setEditingDraft((prev: any) => ({ ...prev, categories: event.target.value }))
                      : setDraft((prev: any) => ({ ...prev, categories: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Tags (comma separated)
                <input
                  type="text"
                  value={editingId ? editingDraft.tags : draft.tags}
                  onChange={(event) =>
                    editingId
                      ? setEditingDraft((prev: any) => ({ ...prev, tags: event.target.value }))
                      : setDraft((prev: any) => ({ ...prev, tags: event.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Content format
                <select
                  value={editingId ? editingDraft.contentFormat : draft.contentFormat}
                  onChange={(event) =>
                    editingId
                      ? setEditingDraft((prev: any) => ({ ...prev, contentFormat: event.target.value as ContentFormat }))
                      : setDraft((prev: any) => ({ ...prev, contentFormat: event.target.value as ContentFormat }))
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
                        ? setEditingDraft((prev: any) => ({ ...prev, status: event.target.value as PostStatus }))
                        : setDraft((prev: any) => ({ ...prev, status: event.target.value as PostStatus }))
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