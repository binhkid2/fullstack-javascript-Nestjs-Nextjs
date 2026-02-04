import { Suspense } from 'react';
import VerifyClient from './VerifyClient';

export const dynamic = 'force-dynamic';

export default function VerifyPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <Suspense fallback={<div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">Loading...</div>}>
        <VerifyClient />
      </Suspense>
    </main>
  );
}
