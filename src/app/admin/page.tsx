'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Drug } from '@/data/drugs';
import { useSession } from '@/components/SessionProvider';
import { Button } from '@/components/Button';

type Row = Drug & {
  _notesDirty?: string;
  _nameDraft?: string;
  _catDraft?: string;
  _confirmDelete?: boolean;
};

type BulkRow = { name: string; notes: string; drug: Row | null; result?: 'ok' | 'err' };

export default function AdminPage() {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session.isAdmin) router.replace('/?auth=required');
  }, [loading, session, router]);

  const [drugs, setDrugs] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [newRow, setNewRow] = useState({ name: '', category: 'Street drugs' });
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);

  const apiErr = async (r: Response) => {
    const b = await r.json().catch(() => ({})) as { error?: string };
    return b.error ?? '';
  };

  const flash = (msg: string, ok = true) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, ok });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const load = async () => {
    const r = await fetch('/api/drugs', { cache: 'no-store' });
    const j = await r.json();
    setDrugs(Array.isArray(j) ? j : []);
  };
  useEffect(() => { load(); }, []);

  const categories = useMemo(
    () => Array.from(new Set(drugs.map((d) => d.category))).sort(),
    [drugs],
  );

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    return drugs.filter((d) => {
      const matchesCat = filterCat === 'all' || d.category === filterCat;
      const matchesQ = !s || d.name.toLowerCase().includes(s) || (d.notes || '').toLowerCase().includes(s);
      return matchesCat && matchesQ;
    });
  }, [drugs, q, filterCat]);

  const stats = useMemo(() => ({
    total: drugs.length,
    withNotes: drugs.filter((d) => (d.notes || '').trim().length > 0).length,
    categories: categories.length,
  }), [drugs, categories]);

  const patch = async (id: number, payload: Partial<Drug>, label: string) => {
    setBusy(`${label}-${id}`);
    const r = await fetch(`/api/drugs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setBusy(null);
    if (!r.ok) { const e = await apiErr(r); flash(`Opslaan mislukt${e ? `: ${e}` : ''}`, false); return false; }
    flash('Opgeslagen');
    return true;
  };

  const saveNotes = async (row: Row) => {
    const ok = await patch(row.id, { notes: row._notesDirty ?? '' }, 'note');
    if (ok) setDrugs((cur) => cur.map((d) => d.id === row.id ? { ...d, notes: row._notesDirty ?? '', _notesDirty: undefined } : d));
  };

  const saveName = async (id: number, name: string) => {
    const ok = await patch(id, { name }, 'name');
    if (ok) setDrugs((cur) => cur.map((d) => d.id === id ? { ...d, name, _nameDraft: undefined } : d));
  };

  const saveCat = async (id: number, category: string) => {
    const ok = await patch(id, { category }, 'cat');
    if (ok) setDrugs((cur) => cur.map((d) => d.id === id ? { ...d, category, _catDraft: undefined } : d));
  };

  const remove = async (id: number) => {
    setBusy(`del-${id}`);
    const r = await fetch(`/api/drugs/${id}`, { method: 'DELETE' });
    setBusy(null);
    if (!r.ok) { const e = await apiErr(r); flash(`Verwijderen mislukt${e ? `: ${e}` : ''}`, false); return; }
    setDrugs((cur) => cur.filter((d) => d.id !== id));
    flash('Verwijderd');
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
    if (!r.ok) { const e = await apiErr(r); flash(`Toevoegen mislukt${e ? `: ${e}` : ''}`, false); return; }
    const created = (await r.json()) as Drug;
    setDrugs((cur) => [created, ...cur]);
    setNewRow({ name: '', category: newRow.category });
    flash('Toegevoegd');
  };

  const parseBulk = () => {
    const rows = bulkText
      .split(/(?:^|\n)---(?:\n|$)/)
      .map((b) => b.trim())
      .filter(Boolean)
      .map((b) => {
        const lines = b.split('\n');
        const fi = lines.findIndex((l) => l.trim());
        const name = fi >= 0 ? lines[fi].trim() : '';
        const notes = lines.slice(fi + 1).join('\n').trim();
        const drug = drugs.find((d) => d.name.toLowerCase().trim() === name.toLowerCase()) ?? null;
        return { name, notes, drug };
      });
    setBulkRows(rows);
  };

  const runBulkImport = async () => {
    setBulkBusy(true);
    for (const row of bulkRows.filter((r) => r.drug)) {
      const ok = await patch(row.drug!.id, { notes: row.notes }, 'bulk');
      if (ok) setDrugs((cur) => cur.map((d) => d.id === row.drug!.id ? { ...d, notes: row.notes } : d));
      setBulkRows((cur) => cur.map((r) => r === row ? { ...r, result: ok ? 'ok' : 'err' } : r));
    }
    setBulkBusy(false);
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="card rounded-none border-x-0 border-t-0 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">
              <span className="text-textc">Psychonaut</span>{' '}
              <span className="text-primary">Admin</span>
            </h1>
            <p className="text-xs text-textc/50 mt-0.5">
              {stats.total} stoffen · {stats.withNotes} met notities · {stats.categories} categorieën
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/" className="btn">← Terug</Link>
            <Button
              variant="danger"
              onClick={async () => { await fetch('/api/auth/signout', { method: 'POST' }); window.location.href = '/'; }}
            >
              Uitloggen
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {/* Add substance */}
        <section className="card p-5">
          <h2 className="text-xs font-bold text-textc/50 uppercase tracking-widest mb-3">Stof toevoegen</h2>
          <form onSubmit={add} className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-textc/50 block mb-1">Naam</label>
              <input
                className="input w-full"
                value={newRow.name}
                onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
                placeholder="bijv. 4-HO-MET"
              />
            </div>
            <div className="min-w-[160px]">
              <label className="text-xs text-textc/50 block mb-1">Categorie</label>
              <input
                className="input w-full"
                list="admin-cats"
                value={newRow.category}
                onChange={(e) => setNewRow({ ...newRow, category: e.target.value })}
              />
              <datalist id="admin-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <button className="btn btn-primary" type="submit" disabled={busy === 'add'}>
              {busy === 'add' ? 'Bezig…' : 'Toevoegen'}
            </button>
          </form>
        </section>

        {/* Bulk import */}
        <section className="card p-4">
          <button
            className="flex w-full items-center justify-between text-xs font-bold text-textc/50 uppercase tracking-widest"
            type="button"
            onClick={() => setBulkOpen((o) => !o)}
          >
            Bulk import notities
            <span>{bulkOpen ? '▲' : '▼'}</span>
          </button>
          {bulkOpen && (
            <div className="mt-4 space-y-3">
              <textarea
                className="input w-full min-h-[120px] text-sm font-mono"
                placeholder={'Naam\nnotities hier\n---\nVolgende stof\nmeer notities'}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />
              <button
                className="btn btn-primary text-xs"
                type="button"
                disabled={!bulkText.trim()}
                onClick={parseBulk}
              >
                Voorvertoning
              </button>
              {bulkRows.length > 0 && (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-textc/40 text-left">
                        <th className="pb-1 pr-3 font-medium">Naam</th>
                        <th className="pb-1 pr-3 font-medium">Notitie (preview)</th>
                        <th className="pb-1 pr-3 font-medium">Status</th>
                        {bulkRows.some((r) => r.result) && <th className="pb-1 font-medium">Resultaat</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderc">
                      {bulkRows.map((row, i) => (
                        <tr key={i}>
                          <td className="py-1.5 pr-3 font-medium text-textc">{row.name}</td>
                          <td className="py-1.5 pr-3 text-textc/60 max-w-[200px] truncate">
                            {row.notes.slice(0, 80)}{row.notes.length > 80 ? '…' : ''}
                          </td>
                          <td className="py-1.5 pr-3">
                            {!row.drug
                              ? <span className="text-xs text-red-400">geen match</span>
                              : row.drug.notes?.trim()
                                ? <span className="text-xs text-amber-400">matched</span>
                                : <span className="text-xs text-green-400">nieuw</span>
                            }
                          </td>
                          {bulkRows.some((r) => r.result) && (
                            <td className="py-1.5">
                              {row.result === 'ok' && <span className="text-green-400">✓</span>}
                              {row.result === 'err' && <span className="text-red-400">✗</span>}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-end">
                    <button
                      className="btn btn-primary text-xs"
                      type="button"
                      disabled={bulkBusy || bulkRows.filter((r) => r.drug).length === 0}
                      onClick={runBulkImport}
                    >
                      {bulkBusy ? 'Bezig…' : `Importeer ${bulkRows.filter((r) => r.drug).length} notities`}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* List */}
        <section className="card p-4">
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <input
              className="input flex-1 min-w-[180px]"
              placeholder="Zoek naam of notities…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="input"
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
            >
              <option value="all">Alle categorieën</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="text-xs text-textc/40 ml-auto">{filtered.length} getoond</span>
          </div>

          <div className="divide-y divide-borderc">
            {filtered.map((d) => {
              const notesDirty = d._notesDirty !== undefined && d._notesDirty !== (d.notes ?? '');
              const nameDirty = d._nameDraft !== undefined && d._nameDraft !== d.name;
              const catDirty = d._catDraft !== undefined && d._catDraft !== d.category;
              return (
                <div key={d.id} className="py-3 flex flex-col gap-2">
                  {/* Name + category row */}
                  <div className="flex items-start gap-2">
                    <div className="relative flex-1 min-w-0">
                      <input
                        className={`input w-full font-semibold ${nameDirty ? 'border-primary/60' : ''}`}
                        value={d._nameDraft ?? d.name}
                        onChange={(e) => setDrugs((cur) => cur.map((r) => r.id === d.id ? { ...r, _nameDraft: e.target.value } : r))}
                      />
                      {nameDirty && (
                        <div className="flex gap-1 mt-1">
                          <button className="btn text-xs py-0 px-2 h-7" onClick={() => setDrugs((cur) => cur.map((r) => r.id === d.id ? { ...r, _nameDraft: undefined } : r))}>Reset</button>
                          <button className="btn btn-primary text-xs py-0 px-2 h-7" disabled={busy === `name-${d.id}`} onClick={() => saveName(d.id, d._nameDraft!.trim())}>
                            {busy === `name-${d.id}` ? '…' : 'Opslaan'}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="relative w-36 flex-shrink-0">
                      <input
                        className={`input w-full text-sm ${catDirty ? 'border-primary/60' : ''}`}
                        list="admin-cats"
                        value={d._catDraft ?? d.category}
                        onChange={(e) => setDrugs((cur) => cur.map((r) => r.id === d.id ? { ...r, _catDraft: e.target.value } : r))}
                      />
                      {catDirty && (
                        <div className="flex gap-1 mt-1">
                          <button className="btn text-xs py-0 px-2 h-7" onClick={() => setDrugs((cur) => cur.map((r) => r.id === d.id ? { ...r, _catDraft: undefined } : r))}>Reset</button>
                          <button className="btn btn-primary text-xs py-0 px-2 h-7" disabled={busy === `cat-${d.id}`} onClick={() => saveCat(d.id, d._catDraft!.trim())}>
                            {busy === `cat-${d.id}` ? '…' : 'Opslaan'}
                          </button>
                        </div>
                      )}
                    </div>
                    {/* Delete with inline confirm */}
                    {d._confirmDelete ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-textc/60">Zeker?</span>
                        <button
                          className="btn text-xs py-0 px-2 h-8"
                          onClick={() => setDrugs((cur) => cur.map((r) => r.id === d.id ? { ...r, _confirmDelete: false } : r))}
                        >
                          Nee
                        </button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={busy === `del-${d.id}`}
                          onClick={() => remove(d.id)}
                        >
                          {busy === `del-${d.id}` ? '…' : 'Ja, verwijder'}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDrugs((cur) => cur.map((r) => r.id === d.id ? { ...r, _confirmDelete: true } : r))}
                      >
                        Verwijder
                      </Button>
                    )}
                  </div>

                  {/* Notes */}
                  <textarea
                    className="input w-full min-h-[56px] text-sm"
                    placeholder="Notities…"
                    value={d._notesDirty ?? d.notes ?? ''}
                    onChange={(e) => setDrugs((cur) => cur.map((r) => r.id === d.id ? { ...r, _notesDirty: e.target.value } : r))}
                  />
                  {notesDirty && (
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn text-xs"
                        onClick={() => setDrugs((cur) => cur.map((r) => r.id === d.id ? { ...r, _notesDirty: undefined } : r))}
                      >
                        Reset
                      </button>
                      <button
                        className="btn btn-primary text-xs"
                        onClick={() => saveNotes(d)}
                        disabled={busy === `note-${d.id}`}
                      >
                        {busy === `note-${d.id}` ? 'Opslaan…' : 'Notitie opslaan'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-8 text-center text-textc/40">Geen stoffen gevonden.</div>
            )}
          </div>
        </section>
      </main>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] card px-5 py-2.5 text-sm font-medium ${toast.ok ? 'text-green-400' : 'text-red-400'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
