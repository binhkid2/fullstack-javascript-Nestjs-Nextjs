'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import ProfileCard from './ProfileCard';
import BlogPostsTable from './BlogPostsTable';
import BlogPostForm from './BlogPostForm';
import UserTable from './UserTable';

const statusOptions = ['draft', 'published', 'archived'] as const;

type PostStatus = (typeof statusOptions)[number];
 

type UserRow = {
  id: string;
  name?: string | null;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
};

const emptyDraft = (): any => ({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  contentFormat: 'markdown',
  featuredImageId: '',
  featuredImageUrl: '',
  featuredImageAlt: '',
  categories: '',
  tags: '',
});

type Props = {
  userEmail: string;
  userRole: string;
};

export default function DashboardClient({ userEmail, userRole }: Props) {
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
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

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed');
      const data = (await response.json()) as UserRow[];
      setUsers(data ?? []);
    } catch {
      const message = 'Unable to load users.';
      setUsersError(message);
      toast.error(message);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    if (userRole === 'ADMIN') {
      loadUsers();
    }
  }, []);

  const normalizeMeta = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const buildFeaturedImage = (data: any) =>
    data.featuredImageUrl.trim().length > 0
      ? {
          id: data.featuredImageId.trim() || crypto.randomUUID(),
          url: data.featuredImageUrl.trim(),
          alt: data.featuredImageAlt.trim() || null,
        }
      : undefined;

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const categories = normalizeMeta(draft.categories);
    const tags = normalizeMeta(draft.tags);
    const featuredImage = buildFeaturedImage(draft);

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
      contentFormat: post.contentFormat ?? 'markdown',
      status: post.status,
      featuredImageId: post.featuredImage?.id ?? '',
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

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) return;

    const categories = normalizeMeta(editingDraft.categories);
    const tags = normalizeMeta(editingDraft.tags);
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
    try {
      const response = await fetch(`/api/blog-posts/${postId}`, {
        method: 'DELETE',
      });

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

    const shouldProceed = confirm(
      `Change status from ${current.status} to ${nextStatus}?`,
    );
    if (!shouldProceed) return;

    setUpdatingStatusId(postId);
    try {
      const response = await fetch(`/api/blog-posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
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
      <ProfileCard userEmail={userEmail} userRole={userRole} />
  {userRole === 'ADMIN' ? (
        <>
          {usersLoading ? (
            <p className="text-sm text-gray-500">Loading users...</p>
          ) : null}
          {usersError ? (
            <p className="text-sm text-red-600">{usersError}</p>
          ) : null}
          {!usersLoading && !usersError ? (
            <UserTable
              users={users}
              onUsersChange={(updater) => setUsers((prev) => updater(prev))}
            />
          ) : null}
        </>
      ) : null}
      <BlogPostsTable
        posts={sortedPosts}
        loading={loading}
        error={error}
        canEdit={canEdit}
        canDelete={canDelete}
        updatingStatusId={updatingStatusId}
        onEdit={startEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onRefresh={loadPosts}
      />

      {canCreate ? (
        <BlogPostForm
          draft={editingId ? editingDraft : draft}
          editingId={editingId}
          canEdit={canEdit}
          onSubmit={editingId ? handleUpdate : handleCreate}
          onCancel={cancelEdit}
          onChange={(updater) =>
            editingId
              ? setEditingDraft((prev: any) => updater(prev))
              : setDraft((prev:any) => updater(prev))
          }
        />
      ) : null} 
    </div>
  );
}
