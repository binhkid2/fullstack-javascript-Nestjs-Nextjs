import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-10 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
          Welcome
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-gray-900">
          Simple secure sign-in
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Use a magic link to access your account without passwords or friction.
        </p>
        <p className="mt-2 text-gray-600">
          We will send a one-time sign-in link straight to your inbox.
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="inline-flex items-center rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
