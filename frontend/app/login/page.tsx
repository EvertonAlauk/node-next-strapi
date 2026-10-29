export const instant = false;
import Link from 'next/link';
import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';
import { REDIRECT_PARAM, safeRedirectPath } from '@/lib/redirect';

type LoginPageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Reads ?redirect_to from the URL and fills both columns. Inside <Suspense> because searchParams is request-time data.
async function LoginContent({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = safeRedirectPath(params[REDIRECT_PARAM]);
  const hasRedirect = redirectTo !== '/';
  const registerHref = '/register';

  return (
    <>
      <aside>
        <h1 className="mb-2 whitespace-nowrap text-3xl font-extrabold tracking-tight">Log in</h1>
        <p className="whitespace-nowrap text-sm text-gray-500">
          No account yet?{' '}
          <Link href={registerHref} className="font-semibold text-gray-900 hover:underline">
            Register
          </Link>
        </p>
      </aside>

      <div>
        <LoginForm redirectTo={hasRedirect ? redirectTo : ''} />
      </div>
    </>
  );
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto grid max-w-4xl gap-8 p-3 sm:p-8 md:grid-cols-[320px_1fr]">
        <Suspense fallback={<p>Loading...</p>}>
          <LoginContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
