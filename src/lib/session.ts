import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '';
const COOKIE = 'psy_session';
const SESSION_TTL = 60 * 60 * 24 * 30;

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'contact@jordy.beer').toLowerCase();

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url');
}

export function sign(payload: Record<string, unknown>, ttlSec: number) {
  if (!SECRET) throw new Error('AUTH_SECRET missing');
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSec };
  const data = b64url(JSON.stringify(body));
  const sig = b64url(createHmac('sha256', SECRET).update(data).digest());
  return `${data}.${sig}`;
}

export function verify<T = Record<string, unknown>>(token: string): T | null {
  if (!SECRET || !token || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expected = b64url(createHmac('sha256', SECRET).update(data).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const body = JSON.parse(Buffer.from(data, 'base64url').toString()) as { exp?: number };
    if (body.exp && body.exp < Math.floor(Date.now() / 1000)) return null;
    return body as T;
  } catch {
    return null;
  }
}

export async function setSessionCookie(email: string) {
  const token = sign({ email: email.toLowerCase() }, SESSION_TTL);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<{ email: string } | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const payload = verify<{ email: string }>(token);
  return payload?.email ? { email: payload.email } : null;
}

export function isAdmin(session: { email: string } | null) {
  return !!session && session.email.toLowerCase() === ADMIN_EMAIL;
}
