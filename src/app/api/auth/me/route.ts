import { NextResponse } from 'next/server';
import { getSession, isAdmin } from '@/lib/session';

export async function GET() {
  const session = getSession();
  return NextResponse.json({
    email: session?.email ?? null,
    isAdmin: isAdmin(session),
  });
}
