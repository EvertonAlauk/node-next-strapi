import Link from 'next/link';
import { logout } from '@/app/login/actions';
import { getSession } from '@/lib/session';

const outlineButtonClass =
  'border border-gray-400 text-gray-800 hover:bg-black hover:border-black hover:text-white font-bold py-2 px-4 rounded-full cursor-pointer';

// Shown on every page. Only reads the session, so it never redirects (the login page uses it too).
export default async function Navbar() {
  const session = await getSession();

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          My posts app
        </Link>

        {session && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Signed in as <span className="font-semibold text-gray-900">{session.user.username}</span>
            </span>
            <form action={logout}>
              <button type="submit" className={outlineButtonClass}>
                Log out
              </button>
            </form>
          </div>
        )}
      </nav>
    </header>
  );
}
