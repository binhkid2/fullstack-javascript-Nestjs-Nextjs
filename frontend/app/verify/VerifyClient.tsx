'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const email = useMemo(() => searchParams.get('email') ?? '', [searchParams]);
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

  useEffect(() => {
    if (!email || !token) {
      return;
    }

    let active = true;

    const verify = async () => {
      setStatus('loading');
      const result = await signIn('magic-link', {
        redirect: true,
        callbackUrl: '/dashboard',
        email,
        token,
      });

      if (!active) {
        return;
      }

      if (result?.error) {
        setStatus('error');
      }
    };

    verify();

    return () => {
      active = false;
    };
  }, [email, token]);

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
      <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Verify</p>
      <h1 className="mt-3 text-3xl font-semibold text-gray-900">
        {status === 'error' ? 'Link invalid' : 'Signing you in'}
      </h1>
      <p className="mt-3 text-gray-600">
        {status === 'error'
          ? 'This link is invalid or expired. Please request a new one.'
          : 'Please wait while we confirm your magic link.'}
      </p>
    </div>
  );
}
