'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

const categories = [
  { label: 'Frontend', value: 'frontend' },
  { label: 'Backend', value: 'backend' },
  { label: 'Design', value: 'design' },
  { label: 'Performance', value: 'performance' },
];

export default function SiteHeader() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img
                src="https://logos-world.net/wp-content/uploads/2021/08/Blogger-Logo-2010-2013.png"
                alt="Blogger logo"
                className="h-7 w-7"
              />
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900">Duc Binh&apos;s blog</p>
              <p className="text-xs text-slate-500">Nestjs + Next.js blogs app</p>
            </div>
          </Link>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          <form
            action="/"
            method="get"
            className="flex min-w-[220px] flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm sm:min-w-[280px]"
          >
            <input
              name="q"
              placeholder="Search posts"
              className="w-full bg-transparent text-sm text-slate-700 outline-none"
            />
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
    </header>
  );
}
