import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const { data, error } = await supabase
    .from('drugs')
    .select('id, notes')
    .neq('notes', '');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    (data ?? []).map((r: { id: number | string; notes: string }) => ({
      drug_id: String(r.id),
      content: r.notes,
    })),
  );
}

export async function POST(req: NextRequest) {
  const guard = requireAdmin();
  if (!guard.ok) return guard.response;

  const { drug_id, content } = (await req.json().catch(() => ({}))) as {
    drug_id?: string;
    content?: string;
  };
  if (!drug_id) {
    return NextResponse.json({ error: 'drug_id required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('drugs')
    .update({ notes: content ?? '', updated_at: new Date().toISOString() })
    .eq('id', drug_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
