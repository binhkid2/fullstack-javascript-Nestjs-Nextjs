import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth');
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-6">
        <DashboardClient
          userEmail={session.user?.email ?? 'Unknown'}
          userRole={(session.user as any)?.role ?? 'MEMBER'}
        />
      </div>
    </main>
  );
}
