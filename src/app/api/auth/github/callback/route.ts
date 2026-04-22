import { NextRequest, NextResponse } from 'next/server';
import { setSessionCookie, ADMIN_EMAIL } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) return NextResponse.redirect(new URL('/?auth=invalid', req.url));

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/?auth=error', req.url));
    }

    const redirectUri = `${req.nextUrl.origin}/api/auth/github/callback`;

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
    });

    const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
    if (!tokenData.access_token) return NextResponse.redirect(new URL('/?auth=invalid', req.url));

    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'snuffdb' },
    });

    const emails = await emailsRes.json() as { email: string; primary: boolean; verified: boolean }[];
    if (!Array.isArray(emails)) return NextResponse.redirect(new URL('/?auth=invalid', req.url));

    const primary = emails.find((e) => e.primary && e.verified);
    if (!primary || primary.email.toLowerCase() !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/?auth=invalid', req.url));
    }

    await setSessionCookie(primary.email);
    return NextResponse.redirect(new URL('/admin', req.url));
  } catch {
    return NextResponse.redirect(new URL('/?auth=error', req.url));
  }
}
