import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';

export default async function ProtectedExamplePage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="text-3xl font-bold">Protected Example</h1>
      <p className="mt-3 text-muted-foreground">
        This page is protected server-side using getServerSession via getAuthSession.
      </p>
      <div className="mt-6 rounded-lg border p-4">
        <p>
          Signed in as: <strong>{session.user.email}</strong>
        </p>
        <p>
          Role: <strong>{session.user.role}</strong>
        </p>
      </div>
    </main>
  );
}
