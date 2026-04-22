import { NextRequest, NextResponse } from 'next/server';

const PW_API = 'https://api.psychonautwiki.org/';
const TIMEOUT_MS = 8000;

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name');
  if (!name) return NextResponse.json({ error: 'missing name' }, { status: 400 });

  const includeInteractions = req.nextUrl.searchParams.get('interactions') === '1';
  const query = `{
    substances(query: ${JSON.stringify(name)}) {
      name url
      roas {
        name
        dose { units threshold light { min max } common { min max } strong { min max } heavy }
        duration {
          onset { min max units } comeup { min max units } peak { min max units }
          offset { min max units } total { min max units } afterglow { min max units }
        }
      }
      ${includeInteractions ? 'interactions { name status }' : ''}
    }
  }`;

  try {
    const res = await fetch(PW_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
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
