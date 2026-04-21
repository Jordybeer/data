import { NextRequest, NextResponse } from 'next/server';
import { verify, setSessionCookie, ADMIN_EMAIL } from '@/lib/session';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const payload = verify<{ email: string; kind: string }>(token);
  if (!payload || payload.kind !== 'magic' || payload.email.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.redirect(new URL('/?auth=invalid', req.url));
  }
  setSessionCookie(payload.email);
  return NextResponse.redirect(new URL('/admin', req.url));
}
