import { NextRequest, NextResponse } from 'next/server';
import { sign, ADMIN_EMAIL } from '@/lib/session';
import { sendMagicLink } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  if (email.trim().toLowerCase() === ADMIN_EMAIL) {
    const token = sign({ email: ADMIN_EMAIL, kind: 'magic' }, 60 * 15);
    const origin =
      process.env.NEXTAUTH_URL ||
      process.env.APP_URL ||
      `${req.nextUrl.protocol}//${req.headers.get('host')}`;
    const url = `${origin.replace(/\/$/, '')}/api/auth/verify?token=${encodeURIComponent(token)}`;
    try {
      await sendMagicLink(ADMIN_EMAIL, url);
    } catch (err) {
      console.error('[magic-link] send failed', err);
      return NextResponse.json(
        { error: 'Email delivery failed — check SMTP config on the server.' },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
