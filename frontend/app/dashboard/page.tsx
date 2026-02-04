import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth');
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">
          Welcome back
        </h1>
        <p className="mt-3 text-gray-600">
          You are signed in as <span className="font-medium">{session.user?.email}</span>.
        </p>
      </div>
    </main>
  );
}
