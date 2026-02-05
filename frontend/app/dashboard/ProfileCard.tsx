'use client';

import { signOut } from 'next-auth/react';

type Props = {
  userEmail: string;
  userRole: string;
};

export default function ProfileCard({ userEmail, userRole }: Props) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-xl">
      <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Profile</p>
      <h2 className="mt-3 text-2xl font-semibold text-gray-900">
        Welcome back
      </h2>
      <p className="mt-3 text-gray-600">
        You are signed in as <span className="font-medium">{userEmail}</span>.
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Role: <span className="font-semibold text-gray-700">{userRole}</span>
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={() => {
            if (confirm('Sign out now?')) {
              signOut({ callbackUrl: '/' });
            }
          }}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
