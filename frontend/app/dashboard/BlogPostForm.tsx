'use client';

import type { FormEvent } from 'react';

const statusOptions = ['draft', 'published', 'archived'] as const;
const formatOptions = ['markdown', 'html'] as const;

type PostStatus = (typeof statusOptions)[number];
type ContentFormat = (typeof formatOptions)[number];

type BlogPostDraft = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentFormat: ContentFormat;
  status?: PostStatus;
  isFeatured?: boolean;
  featuredImageId: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  categories: string;
  tags: string;
};

type Props = {
  draft: BlogPostDraft;
  editingId: string | null;
  canEdit: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  onChange: (updater: (draft: BlogPostDraft) => BlogPostDraft) => void;
};

export default function BlogPostForm({
  draft,
  editingId,
  canEdit,
  onSubmit,
  onCancel,
  onChange,
}: Props) {
  return (
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

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Title
          <input
            type="text"
            required
            value={draft.title}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, title: event.target.value }))
            }
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Slug
          <input
            type="text"
            value={draft.slug}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, slug: event.target.value }))
            }
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Excerpt
          <input
            type="text"
            value={draft.excerpt}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, excerpt: event.target.value }))
            }
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Featured image URL
            <input
              type="url"
              value={draft.featuredImageUrl}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  featuredImageUrl: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Featured image alt
            <input
              type="text"
              value={draft.featuredImageAlt}
              onChange={(event) =>
                onChange((prev) => ({
                  ...prev,
                  featuredImageAlt: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-gray-700">
          Featured image ID (optional)
          <input
            type="text"
            value={draft.featuredImageId}
            onChange={(event) =>
              onChange((prev) => ({
                ...prev,
                featuredImageId: event.target.value,
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
            value={draft.content}
            onChange={(event) =>
              onChange((prev) => ({ ...prev, content: event.target.value }))
            }
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Categories (comma separated)
            <input
              type="text"
              value={draft.categories}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, categories: event.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Tags (comma separated)
            <input
              type="text"
              value={draft.tags}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, tags: event.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            Content format
            <select
              value={draft.contentFormat}
              onChange={(event) =>
                onChange((prev) => ({
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

          {canEdit ? (
            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={draft.isFeatured ?? false}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    isFeatured: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              Featured post
            </label>
          ) : null}

          {canEdit && editingId ? (
            <label className="block text-sm font-medium text-gray-700">
              Status
              <select
                value={draft.status ?? 'draft'}
                onChange={(event) =>
                  onChange((prev) => ({
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
              onClick={onCancel}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
