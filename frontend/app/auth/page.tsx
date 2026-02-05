'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { getPasswordErrors } from './passwordRules';

const tabs = ['signin', 'signup', 'reset'] as const;

type Tab = (typeof tabs)[number];

export default function AuthPage() {
  const { status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = (searchParams.get('tab') as Tab) || 'signin';
  const [tab, setTab] = useState<Tab>(
    tabs.includes(initialTab) ? initialTab : 'signin',
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [sessionStatus, router]);

  const goToTab = (next: Tab) => {
    setTab(next);
    setStatus(null);
    setError(null);
    router.replace(`/auth?tab=${next}`);
  };

  const handleMagicLink = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed');
      }

      router.push('/check-email');
    } catch {
      const message = 'Unable to send magic link. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('password', {
        redirect: false,
        callbackUrl: '/dashboard',
        email,
        password,
      });

      if (result?.error || !result?.ok) {
        const message = 'Invalid email or password.';
        setError(message);
        toast.error(message);
        return;
      }

      toast.success('Signed in successfully.');
      router.push(result.url ?? '/dashboard');
    } catch {
      const message = 'Unable to sign in.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const passwordErrors = getPasswordErrors(password);
      if (passwordErrors.length > 0) {
        setError(passwordErrors[0]);
        toast.error(passwordErrors[0]);
        setLoading(false);
        return;
      }
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error('Failed');
      }

      setStatus('Account created. Please sign in.');
      toast.success('Account created. Please sign in.');
      goToTab('signin');
    } catch {
      const message = 'Unable to create account.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed');
      }

      setStatus('If that email exists, we sent a reset link.');
      toast.success('If that email exists, we sent a reset link.');
    } catch {
      const message = 'Unable to request password reset.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
            Sign in to continue
          </p>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-2 rounded-full bg-gray-100 p-1 text-sm">
          <button
            type="button"
            onClick={() => goToTab('signin')}
            className={`rounded-full px-3 py-2 font-medium transition ${
              tab === 'signin' ? 'bg-white shadow' : 'text-gray-500'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => goToTab('signup')}
            className={`rounded-full px-3 py-2 font-medium transition ${
              tab === 'signup' ? 'bg-white shadow' : 'text-gray-500'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => goToTab('reset')}
            className={`rounded-full px-3 py-2 font-medium transition ${
              tab === 'reset' ? 'bg-white shadow' : 'text-gray-500'
            }`}
          >
            Reset Password
          </button>
        </div>

        {status ? <p className="mb-4 text-sm text-green-600">{status}</p> : null}
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        {tab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Email address
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@email.com"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-400"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Password
              <div className="mt-2 flex items-center gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={handleMagicLink}
              disabled={loading || !email}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send magic link
            </button>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Continue with Google
            </button>
          </form>
        ) : null}

        {tab === 'signup' ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Full name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-400"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Email address
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@email.com"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-400"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Password
              <div className="mt-2 flex items-center gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            <p className="text-xs text-gray-500">
              Must be 8+ chars, include upper/lowercase, number, and special
              character.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
        ) : null}

        {tab === 'reset' ? (
          <form onSubmit={handleResetRequest} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Email address
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@email.com"
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-gray-400"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
