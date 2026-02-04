'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { getPasswordErrors } from '../auth/passwordRules';

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        throw new Error('Failed');
      }

      setStatus('Password updated. You can sign in now.');
      toast.success('Password updated. You can sign in now.');
      setTimeout(() => router.push('/auth?tab=signin'), 1200);
    } catch {
      const message = 'Unable to reset password.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
      <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Reset</p>
      <h1 className="mt-3 text-3xl font-semibold text-gray-900">
        Set a new password
      </h1>
      <p className="mt-3 text-gray-600">
        Enter a new password for your account.
      </p>

      {status ? <p className="mt-4 text-sm text-green-600">{status}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          New password
          <div className="mt-2 flex items-center gap-2">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
          {loading ? 'Saving...' : 'Update password'}
        </button>
      </form>
    </div>
  );
}
