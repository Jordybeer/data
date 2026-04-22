import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { setSessionCookie, ADMIN_EMAIL } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) return NextResponse.redirect(new URL('/?auth=invalid', req.url));

    const cookieStore = await cookies();
    const pending: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (toSet) => { toSet.forEach((c) => pending.push(c)); },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('exchangeCodeForSession error:', error.message);
      return NextResponse.redirect(new URL(`/?auth=invalid&reason=${encodeURIComponent(error.message)}`, req.url));
    }
    if (!data.user) return NextResponse.redirect(new URL('/?auth=invalid', req.url));

    if (data.user.email?.toLowerCase() !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL('/?auth=invalid', req.url));
    }

    await setSessionCookie(data.user.email!);
    return NextResponse.redirect(new URL('/admin', req.url));
  } catch (e) {
    console.error('GitHub callback error:', e);
    return NextResponse.redirect(new URL('/?auth=error', req.url));
  }
}
