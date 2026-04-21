import { NextResponse } from 'next/server';
import { getSession, isAdmin } from './session';

export async function requireAdmin() {
  const session = await getSession();
  if (!isAdmin(session)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { ok: true as const, session: session! };
}
