import { NextRequest, NextResponse } from 'next/server';
import { verify, ADMIN_EMAIL } from '@/lib/session';

const COOKIE = 'psy_session';

export function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value ?? '';
  const payload = verify<{ email: string }>(token);
  const authed = !!payload?.email && payload.email.toLowerCase() === ADMIN_EMAIL;

  if (!authed) {
    return NextResponse.redirect(new URL('/?auth=required', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
