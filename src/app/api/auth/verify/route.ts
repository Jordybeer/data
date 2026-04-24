import { NextRequest, NextResponse } from 'next/server';
import { verify, tokenHash, setSessionCookie, ADMIN_EMAIL } from '@/lib/session';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const payload = verify<{ email: string; kind: string }>(token);

  if (!payload || payload.kind !== 'magic' || payload.email.toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.redirect(new URL('/?auth=invalid', req.url), {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const hash = tokenHash(token);
  const db = getSupabaseAdmin();

  const { data, error } = await db
    .from('magic_tokens')
    .select('hash')
    .eq('hash', hash)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return NextResponse.redirect(new URL('/?auth=invalid', req.url), {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  // TODO: add pg_cron job to purge expired rows: DELETE FROM magic_tokens WHERE expires_at < now()
  await db.from('magic_tokens').delete().eq('hash', hash);

  await setSessionCookie(payload.email);
  return NextResponse.redirect(new URL('/admin', req.url), {
    headers: { 'Cache-Control': 'no-store' },
  });
}
