'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE } from '@/lib/session';
import { REDIRECT_PARAM, safeRedirectPath } from '@/lib/redirect';

const API = process.env.NEXT_PUBLIC_API_URL;

const ONE_WEEK = 60 * 60 * 24 * 7;

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const identifier = String(formData.get('identifier') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!identifier || !password) return { error: 'Enter your email/username and password.' };

  let res: Response;
  try {
    res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
      cache: 'no-store',
    });
  } catch {
    return { error: 'Could not connect to the API.' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.error || 'Login failed.' };
  }

  const { jwt } = await res.json();
  await setSessionCookie(jwt);
  redirect(safeRedirectPath(formData.get(REDIRECT_PARAM)));
}

export async function register(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!username || !email || !password) return { error: 'Fill in all the fields.' };

  let res: Response;
  try {
    res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
      cache: 'no-store',
    });
  } catch {
    return { error: 'Could not connect to the API.' };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.error || 'Could not create the account.' };
  }

  // Registering also logs the new user in, and goes straight to the home page
  const { jwt } = await res.json();
  await setSessionCookie(jwt);
  redirect('/');
}

async function setSessionCookie(jwt: string) {
  (await cookies()).set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ONE_WEEK,
  });
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/login');
}
