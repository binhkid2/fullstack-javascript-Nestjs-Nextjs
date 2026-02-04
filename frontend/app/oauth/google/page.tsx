import { Suspense } from 'react';
import GoogleCallbackClient from './GoogleCallbackClient';

export const dynamic = 'force-dynamic';

export default function GoogleCallbackPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <Suspense
        fallback={
          <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
            Loading...
          </div>
        }
      >
        <GoogleCallbackClient />
      </Suspense>
    </main>
  );
}
