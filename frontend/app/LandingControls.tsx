'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most_viewed', label: 'Most viewed' },
  { value: 'featured', label: 'Featured' },
];

type Props = {
  total: number;
  page: number;
  pageSize: number;
  q: string;
  tags: string;
  category: string;
  sort: string;
};

export default function LandingControls({
  total,
  page,
  pageSize,
  q,
  tags,
  category,
  sort,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(q);
  const [tagInput, setTagInput] = useState(tags);
  const [categoryInput, setCategoryInput] = useState(category);
  const [sortInput, setSortInput] = useState(sort);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize],
  );

  const buildParams = (overrides?: Partial<Record<string, string>>) => {
    const params = new URLSearchParams(searchParams);

    params.set('page', String(page));
    params.set('pageSize', String(pageSize));

    const next = {
      q: search,
      tags: tagInput,
      category: categoryInput,
      sort: sortInput,
      ...overrides,
    };

    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    return params;
  };

  const applyFilters = () => {
    const params = buildParams({ page: '1' });
    router.replace(`/?${params.toString()}`);
  };

  const goToPage = (nextPage: number) => {
    const params = buildParams({ page: String(nextPage) });
    router.replace(`/?${params.toString()}`);
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm font-medium text-gray-700">
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or excerpt"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Tags (comma separated)
          <input
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            placeholder="ai, backend"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Categories (comma separated)
          <input
            value={categoryInput}
            onChange={(event) => setCategoryInput(event.target.value)}
            placeholder="tech, news"
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Sort by
          <select
            value={sortInput}
            onChange={(event) => setSortInput(event.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Apply
        </button>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <button
            type="button"
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => goToPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
