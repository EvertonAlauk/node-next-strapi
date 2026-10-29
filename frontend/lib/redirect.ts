export const REDIRECT_PARAM = 'redirect_to';

const AUTH_PATHS = ['/login', '/register'];

// Only same-site paths are allowed, so ?redirect_to can't send users to another domain.
// Anything else (or the auth pages themselves) falls back to the home page.
export function safeRedirectPath(value: unknown): string {
  if (typeof value !== 'string') return '/';
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/';
  if (AUTH_PATHS.some((path) => value === path || value.startsWith(`${path}?`))) return '/';
  return value;
}

// Login URL that remembers where the user was trying to go
export function loginUrl(from: string): string {
  const path = safeRedirectPath(from);
  return path === '/' ? '/login' : `/login?${REDIRECT_PARAM}=${encodeURIComponent(path)}`;
}
