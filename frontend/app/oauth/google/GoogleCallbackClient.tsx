'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function GoogleCallbackClient() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const accessToken = useMemo(
    () => searchParams.get('accessToken') ?? '',
    [searchParams],
  );
  const refreshToken = useMemo(
    () => searchParams.get('refreshToken') ?? '',
    [searchParams],
  );
  const email = useMemo(() => searchParams.get('email') ?? '', [searchParams]);
  const name = useMemo(() => searchParams.get('name') ?? '', [searchParams]);
  const role = useMemo(() => searchParams.get('role') ?? 'MEMBER', [searchParams]);
  const id = useMemo(() => searchParams.get('id') ?? '', [searchParams]);

  useEffect(() => {
    if (!accessToken || !refreshToken || !email) {
      return;
    }

    let active = true;

    const finalize = async () => {
      setStatus('loading');
      const result = await signIn('google-oauth', {
        redirect: true,
        callbackUrl: '/dashboard',
        accessToken,
        refreshToken,
        email,
        name,
        role,
        id,
      });

      if (!active) {
        return;
      }

      if (result?.error) {
        setStatus('error');
      }
    };

    finalize();

    return () => {
      active = false;
    };
  }, [accessToken, refreshToken, email, name, role, id]);

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
      <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Google</p>
      <h1 className="mt-3 text-3xl font-semibold text-gray-900">
        {status === 'error' ? 'Login failed' : 'Signing you in'}
      </h1>
      <p className="mt-3 text-gray-600">
        {status === 'error'
          ? 'We could not complete Google sign-in. Please try again.'
          : 'Please wait while we finish your Google sign-in.'}
      </p>
    </div>
  );
}
