import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
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

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${req.nextUrl.origin}/api/auth/github/callback`,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) return NextResponse.redirect(new URL('/?auth=error', req.url));

    const redirect = NextResponse.redirect(data.url);
    pending.forEach(({ name, value, options }) => redirect.cookies.set(name, value, options as Parameters<typeof redirect.cookies.set>[2]));
    return redirect;
  } catch (e) {
    console.error('GitHub auth error:', e);
    return NextResponse.redirect(new URL('/?auth=error', req.url));
  }
}
