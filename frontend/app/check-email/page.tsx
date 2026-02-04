export default function CheckEmailPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Check inbox</p>
        <h1 className="mt-3 text-3xl font-semibold text-gray-900">
          Magic link sent
        </h1>
        <p className="mt-3 text-gray-600">
          We sent you a magic link. Open it to finish signing in.
        </p>
      </div>
    </main>
  );
}
