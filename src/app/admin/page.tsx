'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Drug } from '@/data/drugs';

type Row = Drug & { _dirty?: string };

export default function AdminPage() {
  const [drugs, setDrugs] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [newRow, setNewRow] = useState({ name: '', category: 'Street drugs' });
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string>('');

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2500);
  };

  const load = async () => {
    const r = await fetch('/api/drugs', { cache: 'no-store' });
    const j = await r.json();
    setDrugs(Array.isArray(j) ? j : []);
  };
  useEffect(() => {
    load();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(drugs.map((d) => d.category))).sort(),
    [drugs],
  );

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    return drugs.filter((d) => {
      const matchesCat = filterCat === 'all' || d.category === filterCat;
      const matchesQ =
        !s || d.name.toLowerCase().includes(s) || (d.notes || '').toLowerCase().includes(s);
      return matchesCat && matchesQ;
    });
  }, [drugs, q, filterCat]);

  const stats = useMemo(() => {
    const withNotes = drugs.filter((d) => (d.notes || '').trim().length > 0).length;
    return { total: drugs.length, withNotes, categories: categories.length };
  }, [drugs, categories]);

  const patch = async (id: number, payload: Partial<Drug>, label: string) => {
    setBusy(`${label}-${id}`);
    const r = await fetch(`/api/drugs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setBusy(null);
    if (!r.ok) {
      flash('Save failed');
      return false;
    }
    flash('Saved');
    return true;
  };

  const saveNote = async (row: Row) => {
    const ok = await patch(row.id, { notes: row._dirty ?? '' }, 'note');
    if (ok) {
      setDrugs((cur) =>
        cur.map((d) => (d.id === row.id ? { ...d, notes: row._dirty ?? '', _dirty: undefined } : d)),
      );
    }
  };

  const remove = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusy(`del-${id}`);
    const r = await fetch(`/api/drugs/${id}`, { method: 'DELETE' });
    setBusy(null);
    if (!r.ok) {
      flash('Delete failed');
      return;
    }
    setDrugs((cur) => cur.filter((d) => d.id !== id));
    flash('Deleted');
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRow.name.trim()) return;
    setBusy('add');
    const r = await fetch('/api/drugs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newRow.name.trim(), category: newRow.category.trim() || 'Street drugs' }),
    });
    setBusy(null);
    if (!r.ok) {
      flash('Add failed');
      return;
    }
    const created = (await r.json()) as Drug;
    setDrugs((cur) => [created, ...cur]);
    setNewRow({ name: '', category: newRow.category });
    flash('Added');
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-card border-b border-borderc sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              <span className="text-textc">Psychonaut</span> Admin
            </h1>
            <p className="text-xs text-textc/60 mt-1">
              {stats.total} substances · {stats.withNotes} with notes · {stats.categories} categories
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn">← Back to site</Link>
            <button
              className="btn bg-red-600 text-white hover:brightness-110"
              onClick={async () => {
                await fetch('/api/auth/signout', { method: 'POST' });
                window.location.href = '/';
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <section className="card p-4">
          <h2 className="text-sm font-semibold text-textc/80 uppercase tracking-wider mb-3">Add substance</h2>
          <form onSubmit={add} className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[220px]">
              <label className="text-xs text-textc/60 block mb-1">Name</label>
              <input
                className="input w-full p-2"
                value={newRow.name}
                onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
                placeholder="e.g. 4-HO-MET"
              />
            </div>
            <div className="min-w-[180px]">
              <label className="text-xs text-textc/60 block mb-1">Category</label>
              <input
                className="input w-full p-2"
                list="admin-cats"
                value={newRow.category}
                onChange={(e) => setNewRow({ ...newRow, category: e.target.value })}
              />
              <datalist id="admin-cats">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <button className="btn btn-primary" type="submit" disabled={busy === 'add'}>
              {busy === 'add' ? 'Adding…' : 'Add'}
            </button>
          </form>
        </section>

        <section className="card p-4">
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <input
              className="input p-2 flex-1 min-w-[200px]"
              placeholder="Search name or notes…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="input p-2"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="text-xs text-textc/60 ml-auto">{filtered.length} shown</span>
          </div>

          <div className="divide-y divide-borderc">
            {filtered.map((d) => {
              const dirty = d._dirty !== undefined && d._dirty !== (d.notes ?? '');
              const noteVal = d._dirty ?? d.notes ?? '';
              return (
                <div key={d.id} className="py-4 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      className="input p-2 flex-1 min-w-[200px] font-semibold"
                      defaultValue={d.name}
                      onBlur={async (e) => {
                        const v = e.target.value.trim();
                        if (v && v !== d.name) {
                          const ok = await patch(d.id, { name: v }, 'name');
                          if (ok) setDrugs((cur) => cur.map((r) => (r.id === d.id ? { ...r, name: v } : r)));
                        }
                      }}
                    />
                    <input
                      className="input p-2 w-48"
                      list="admin-cats"
                      defaultValue={d.category}
                      onBlur={async (e) => {
                        const v = e.target.value.trim();
                        if (v && v !== d.category) {
                          const ok = await patch(d.id, { category: v }, 'cat');
                          if (ok) setDrugs((cur) => cur.map((r) => (r.id === d.id ? { ...r, category: v } : r)));
                        }
                      }}
                    />
                    <button
                      onClick={() => remove(d.id, d.name)}
                      className="btn bg-red-600 text-white hover:brightness-110"
                      disabled={busy === `del-${d.id}`}
                    >
                      {busy === `del-${d.id}` ? '…' : 'Delete'}
                    </button>
                  </div>
                  <textarea
                    className="input w-full p-2 min-h-[60px]"
                    placeholder="Notes…"
                    value={noteVal}
                    onChange={(e) =>
                      setDrugs((cur) =>
                        cur.map((r) => (r.id === d.id ? { ...r, _dirty: e.target.value } : r)),
                      )
                    }
                  />
                  {dirty && (
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn"
                        onClick={() =>
                          setDrugs((cur) =>
                            cur.map((r) => (r.id === d.id ? { ...r, _dirty: undefined } : r)),
                          )
                        }
                      >
                        Reset
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => saveNote(d)}
                        disabled={busy === `note-${d.id}`}
                      >
                        {busy === `note-${d.id}` ? 'Saving…' : 'Save note'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-8 text-center text-textc/60">No substances match.</div>
            )}
          </div>
        </section>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-borderc px-4 py-2 rounded shadow-lg text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
