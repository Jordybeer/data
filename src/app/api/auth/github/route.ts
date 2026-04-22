import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options)),
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
  res.cookies.getAll().forEach((c) => redirect.cookies.set(c.name, c.value));
  return redirect;
}
