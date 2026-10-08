import { serialize, parse } from 'cookie';

export const SESSION_COOKIE_NAME = 'auth-session';
export const SESSION_DURATION = 24 * 60 * 60 * 1000;

function isSecure(): boolean {
  const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  return siteUrl.protocol === 'https:' || !['localhost', '127.0.0.1'].includes(siteUrl.hostname);
}

export function createSessionCookie(token: string, maxAge = SESSION_DURATION): string {
  return serialize(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure(),
    sameSite: 'strict',
    maxAge: Math.floor(maxAge / 1000),
    path: '/',
  });
}

export function deleteSessionCookie(): string {
  return serialize(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isSecure(),
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}

export function parseSessionCookie(cookieHeader: string): string | null {
  const cookies = parse(cookieHeader || '');
  return cookies[SESSION_COOKIE_NAME] || null;
}
