import { NextRequest, NextResponse } from 'next/server';
import { sign, tokenHash, ADMIN_EMAIL } from '@/lib/session';
import { sendMagicLink } from '@/lib/mailer';
import { getSupabaseAdmin } from '@/lib/supabase';

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 3;
// NOTE: This in-memory rate limiter resets on cold starts and is advisory-only on serverless.
// Move to Upstash Redis or Supabase KV for production-grade rate limiting.
const ipBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = ipBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_MAX) return false;
  bucket.count++;
  return true;
}

function getOrigin(req: NextRequest) {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  if (email.trim().toLowerCase() === ADMIN_EMAIL) {
    const token = sign({ email: ADMIN_EMAIL, kind: 'magic' }, 60 * 15);
    const hash = tokenHash(token);

    try {
      await getSupabaseAdmin()
        .from('magic_tokens')
        .insert({ hash, expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() });
    } catch {
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    const url = `${getOrigin(req)}/api/auth/verify?token=${encodeURIComponent(token)}`;
    try {
      await sendMagicLink(ADMIN_EMAIL, url);
    } catch {
      return NextResponse.json(
        { error: 'Email delivery failed — check SMTP config on the server.' },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
