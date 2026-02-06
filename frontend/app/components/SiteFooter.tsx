'use client';

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900">Duc Binh&apos;s blog</p>
          <p className="mt-2 text-sm text-slate-500">
            Nestjs + Next.js blogs app. Notes on shipping full-stack work.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <a href="mailto:hello@ducbinh.blog" className="hover:text-slate-900">
            Contact
          </a>
          <a href="https://github.com" className="hover:text-slate-900">
            GitHub
          </a>
          <a href="https://x.com" className="hover:text-slate-900">
            X / Twitter
          </a>
          <a href="https://www.linkedin.com" className="hover:text-slate-900">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
