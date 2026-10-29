import { NextResponse, type NextRequest } from 'next/server';

// Keep in sync with SESSION_COOKIE in lib/session.ts (proxy should not import app modules)
const SESSION_COOKIE = 'jwt';
const PUBLIC_PATHS = ['/login', '/register'];

// Optimistic check: visitors without a session cookie are sent to /login.
// A cookie alone does not prove the token is valid, so pages still call requireSession().
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const currentPath = `${pathname}${search}`;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!hasSession && !isPublic) {
    const loginUrl = new URL('/login', request.url);
    // Remember where the user was going, so login can send them back there
    loginUrl.searchParams.set('redirect_to', currentPath);
    return NextResponse.redirect(loginUrl);
  }

  // Pass the current path to pages, so requireSession() can redirect with redirect_to
  // when the cookie is present but the token is no longer valid
  const headers = new Headers(request.headers);
  headers.set('x-current-path', currentPath);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Skip Next internals and static files so CSS, JS and images always load
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
