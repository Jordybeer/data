import { NextRequest, NextResponse } from 'next/server';

const TRIPSIT_API = 'https://tripbot.tripsit.me/api/tripsit/getDrug';
const TIMEOUT_MS = 8000;

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name');
  if (!name) return NextResponse.json({ error: 'missing name' }, { status: 400 });

  try {
    const res = await fetch(`${TRIPSIT_API}/${encodeURIComponent(name)}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) return NextResponse.json({ error: `upstream ${res.status}` }, { status: 502 });

    const json = await res.json();
    return NextResponse.json(json, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch {
    return NextResponse.json({ error: 'upstream unavailable' }, { status: 502 });
  }
}
