import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { loginUrl } from '@/lib/redirect';

export const SESSION_COOKIE = 'jwt';

const API = process.env.NEXT_PUBLIC_API_URL;

export type CurrentUser = { id: number; username: string; email: string };
export type Session = { token: string; user: CurrentUser };

// Reads the JWT cookie and asks the API who it belongs to.
// Returns null when logged out or when the token has expired.
// Must run inside <Suspense> (cookies() is request-time data).
export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const res = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  }).catch(() => null);
  if (!res || !res.ok) return null;

  const { user } = await res.json();
  return { token, user };
});

// For pages and actions that need a logged-in user: sends everyone else to /login,
// remembering the current path so login can return the user there
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(loginUrl((await headers()).get('x-current-path') ?? '/'));
  return session;
}
