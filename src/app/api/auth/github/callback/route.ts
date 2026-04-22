import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { setSessionCookie } from '@/lib/session';

const ADMIN_USER_ID = process.env.ADMIN_USER_ID ?? '';

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code');
    if (!code) return NextResponse.redirect(new URL('/?auth=invalid', req.url));

    const cookieStore = await cookies();
    const pending: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (toSet) => { toSet.forEach((c) => pending.push(c)); },
        },
      },
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) return NextResponse.redirect(new URL('/?auth=invalid', req.url));

    if (!ADMIN_USER_ID || data.user.id !== ADMIN_USER_ID) {
      return NextResponse.redirect(new URL('/?auth=invalid', req.url));
    }

    await setSessionCookie(data.user.email!);
    return NextResponse.redirect(new URL('/admin', req.url));
  } catch (e) {
    console.error('GitHub callback error:', e);
    return NextResponse.redirect(new URL('/?auth=error', req.url));
  }
}
