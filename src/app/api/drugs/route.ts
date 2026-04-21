import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const { data, error } = await supabase
    .from('drugs')
    .select('id, name, category, notes')
    .order('category', { ascending: true })
    .order('name', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const guard = requireAdmin();
  if (!guard.ok) return guard.response;

  const { name, category, notes } = (await req.json().catch(() => ({}))) as {
    name?: string;
    category?: string;
    notes?: string;
  };
  if (!name?.trim() || !category?.trim()) {
    return NextResponse.json({ error: 'name and category required' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('drugs')
    .insert({ name: name.trim(), category: category.trim(), notes: notes ?? '' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
