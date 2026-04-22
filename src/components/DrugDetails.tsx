'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Drug } from '@/data/drugs';

interface DrugDetailsProps {
  drug: Drug;
  onClose: () => void;
  isAdmin: boolean;
  onNoteUpdate: (drugId: string, newNote: string) => void;
}

type WikiResult = { url: string; source: 'psychonautwiki' | 'tripsit' | 'wikipedia' } | null;

interface TripSitData { formatted_dose?: string; duration?: string; }
interface Interaction { name: string; status: string; }

type DoseRange = { min: number | null; max: number | null } | null;
type DurRange  = { min: number | null; max: number | null; units: string | null } | null;

interface RoaDose {
  units: string | null;
  threshold: number | null;
  light: DoseRange;
  common: DoseRange;
  strong: DoseRange;
  heavy: number | null;
}

interface RoaDuration {
  onset: DurRange;
  comeup: DurRange;
  peak: DurRange;
  offset: DurRange;
  total: DurRange;
  afterglow: DurRange;
}

interface Roa {
  name: string;
  dose: RoaDose | null;
  duration: RoaDuration | null;
}

const ROA_LABELS: Record<string, string> = {
  oral: 'Oraal', smoked: 'Gerookt', insufflated: 'Nasaal',
  intravenous: 'Intraveneus', sublingual: 'Sublinguaal',
  rectal: 'Rectaal', intramuscular: 'Intramusculair', transdermal: 'Transdermaal',
};

const DOSE_LEVELS = [
  { key: 'threshold', label: 'Drempel', color: 'text-textc/50' },
  { key: 'light',     label: 'Licht',   color: 'text-emerald-400' },
  { key: 'common',    label: 'Gewoon',  color: 'text-yellow-400' },
  { key: 'strong',    label: 'Sterk',   color: 'text-orange-400' },
  { key: 'heavy',     label: 'Zwaar',   color: 'text-red-400' },
] as const;

const DUR_FIELDS = [
  { key: 'onset',     label: 'Aanvang' },
  { key: 'comeup',    label: 'Opbouw' },
  { key: 'peak',      label: 'Piek' },
  { key: 'offset',    label: 'Afbouw' },
  { key: 'total',     label: 'Totaal' },
  { key: 'afterglow', label: 'Nawerkingen' },
] as const;

function fmtDose(dose: RoaDose, key: typeof DOSE_LEVELS[number]['key']): string | null {
  if (!dose) return null;
  const u = dose.units ?? '';
  if (key === 'threshold') return dose.threshold != null ? `${dose.threshold} ${u}`.trim() : null;
  if (key === 'heavy')     return dose.heavy     != null ? `${dose.heavy}+ ${u}`.trim()  : null;
  const r = dose[key] as DoseRange;
  if (!r) return null;
  if (r.min != null && r.max != null) return `${r.min}–${r.max} ${u}`.trim();
  if (r.min != null) return `${r.min}+ ${u}`.trim();
  if (r.max != null) return `≤${r.max} ${u}`.trim();
  return null;
}

function severityEmoji(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('dangerous') || s.includes('deadly')) return '💀';
  if (s.includes('unsafe')) return '⚠️';
  if (s.includes('caution')) return '❗️';
  return '✅';
}

function severityLabel(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('dangerous') || s.includes('deadly')) return 'Gevaarlijk';
  if (s.includes('unsafe')) return 'Onveilig';
  if (s.includes('caution')) return 'Voorzichtigheid';
  if (s.includes('low risk')) return 'Laag risico';
  return 'Onbekend';
}


function fmtDur(r: DurRange): string | null {
  if (!r) return null;
  const u = r.units ?? '';
  if (r.min != null && r.max != null) return `${r.min}–${r.max} ${u}`.trim();
  if (r.min != null) return `${r.min}+ ${u}`.trim();
  if (r.max != null) return `≤${r.max} ${u}`.trim();
  return null;
}

const DrugDetails = ({ drug, onClose, isAdmin, onNoteUpdate }: DrugDetailsProps) => {
  const [contentVisible, setContentVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState(drug.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [wiki, setWiki] = useState<WikiResult>(null);
  const [roas, setRoas] = useState<Roa[] | null>(null);
  const [tripsit, setTripsit] = useState<TripSitData | null>(null);
  const [roasOpen, setRoasOpen] = useState(false);
  const [interactions, setInteractions] = useState<Interaction[] | null>(null);
  const [interactionsOpen, setInteractionsOpen] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let matched = false;
      try {
        const res = await fetch(`/api/psychonautwiki?name=${encodeURIComponent(drug.name)}`);
        const json = await res.json();
        if (cancelled) return;
        const substances: { name: string; url: string; roas: Roa[] }[] = json?.data?.substances ?? [];
        const match = substances.find((s) => s.name.toLowerCase() === drug.name.toLowerCase());
        if (match?.url) {
          setWiki({ url: match.url, source: 'psychonautwiki' });
          setRoas(match.roas ?? []);
          matched = true;
          // fetch interactions separately so a failure here doesn't affect the main result
          fetch(`/api/psychonautwiki?name=${encodeURIComponent(drug.name)}&interactions=1`)
            .then((r) => r.json())
            .then((j) => {
              if (cancelled) return;
              type IxSubstance = { name: string };
              type IxResult = { dangerousInteractions?: IxSubstance[]; unsafeInteractions?: IxSubstance[]; uncertainInteractions?: IxSubstance[] };
              const s = (j?.data?.substances ?? []) as (IxResult & { name: string })[];
              const m = s.find((x) => x.name.toLowerCase() === drug.name.toLowerCase());
              if (!m) { setInteractions([]); return; }
              setInteractions([
                ...(m.dangerousInteractions ?? []).map((x) => ({ name: x.name, status: 'dangerous' })),
                ...(m.unsafeInteractions ?? []).map((x) => ({ name: x.name, status: 'unsafe' })),
                ...(m.uncertainInteractions ?? []).map((x) => ({ name: x.name, status: 'caution' })),
              ]);
            })
            .catch(() => setInteractions([]));
        }
      } catch { /* fall through */ }

      if (cancelled || matched) return;

      try {
        const res = await fetch(`/api/tripsit?name=${encodeURIComponent(drug.name)}`);
        const json = await res.json();
        if (cancelled) return;
        const entry = json?.data?.[0];
        if (entry) {
          setWiki({ url: entry.url ?? `https://tripsit.me/${encodeURIComponent(drug.name.toLowerCase())}`, source: 'tripsit' });
          setTripsit({ formatted_dose: entry.properties?.formatted_dose, duration: entry.properties?.duration });
          setRoas([]);
          const combos: Record<string, { status: string }> = entry.combos ?? {};
          setInteractions(Object.entries(combos).map(([name, v]) => ({ name, status: v.status ?? '' })));
          return;
        }
      } catch { /* fall through */ }

      if (!cancelled) {
        setWiki({ url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(drug.name)}`, source: 'wikipedia' });
        setRoas([]);
        setInteractions([]);
      }
    })();
    return () => { cancelled = true; };
  }, [drug.name]);

  useEffect(() => {
    if (wiki !== null && interactions !== null) {
      const raf = requestAnimationFrame(() => setContentVisible(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [wiki, interactions]);

  const item = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: contentVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.35, delay: contentVisible ? delay : 0, ease: [0.25, 0.46, 0.45, 0.94] as const },
  });

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drug_id: String(drug.id), content: editNote }),
      });
      if (!res.ok) throw new Error();
      onNoteUpdate(String(drug.id), editNote);
      setIsEditing(false);
    } catch {
      setSaveError('Opslaan mislukt. Probeer opnieuw.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
      >
        <div className="overflow-y-auto max-h-[80dvh] p-7">
        {/* Sticky header */}
        <div
          className="pd-modalStickyHeader sticky top-0 z-10 flex justify-between items-start gap-3 pb-4 border-b border-borderc/40"
          style={{ background: 'rgba(15,23,42,0.96)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', margin: '-28px -28px 20px', padding: '20px 28px' }}
        >
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-primary leading-snug">{drug.name}</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-sm font-medium text-primary/80 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">
                {drug.category}
              </span>
              {drug.category2 && (
                <span className="text-sm font-medium text-cyan-300/80 bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-1 rounded-md">
                  {drug.category2}
                </span>
              )}
              {wiki && (
                <a
                  href={wiki.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-textc/70 bg-white/[0.07] border border-white/10 px-2.5 py-1 rounded-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={wiki.source === 'psychonautwiki'
                      ? 'https://www.google.com/s2/favicons?domain=psychonautwiki.org&sz=16'
                      : wiki.source === 'tripsit'
                      ? 'https://www.google.com/s2/favicons?domain=tripsit.me&sz=16'
                      : 'https://www.google.com/s2/favicons?domain=en.wikipedia.org&sz=16'}
                    alt="" width={14} height={14}
                    className="rounded-sm opacity-80"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  Wiki
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Spinner — stays until both wiki and interactions resolve */}
        <AnimatePresence>
          {(wiki === null || interactions === null) && (
            <motion.div
              key="spinner"
              className="mt-5 flex justify-center py-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <motion.svg
                className="w-8 h-8 text-primary/60"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              >
                <path d="M12 2a10 10 0 0 1 10 10" />
              </motion.svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All sections fade in once both fetches complete */}
        {wiki !== null && interactions !== null && (
          <div>
              {/* Notes */}
              <motion.div {...item(0)} className="bg-bg/40 p-5 pt-10 mt-8 rounded-2xl border border-borderc/50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-textc/60 uppercase tracking-widest">Notities</h3>
                  {isAdmin && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="btn text-xs px-3 min-h-[32px]">
                      Bewerken
                    </button>
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.div key="editing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="flex flex-col gap-3">
                      <textarea
                        className="input w-full min-h-[140px] p-3"
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="Notities hier invoeren..."
                        autoFocus
                      />
                      {saveError && <p className="text-sm text-red-400">{saveError}</p>}
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setIsEditing(false); setEditNote(drug.notes || ''); setSaveError(''); }} className="btn">Annuleren</button>
                        <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">{isSaving ? 'Opslaan...' : 'Opslaan'}</button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.p key="viewing" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="text-textc leading-relaxed whitespace-pre-wrap text-sm">
                      {drug.notes || <span className="text-textc/40 italic">Geen notities voor deze stof.</span>}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Dosage & duration — PsychonautWiki */}
              {roas !== null && roas.length > 0 && (
                <motion.div {...item(0.12)} className="mt-3 rounded-2xl border border-borderc/50 overflow-hidden">
                  <button onClick={() => setRoasOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-left" aria-expanded={roasOpen}>
                    <span className="text-xs font-bold text-textc/60 uppercase tracking-widest">Dosering &amp; duur</span>
                    <motion.svg className="w-4 h-4 text-textc/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" animate={{ rotate: roasOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {roasOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-5">
                          {roas.map((roa) => {
                            const roaLabel = ROA_LABELS[roa.name.toLowerCase()] ?? roa.name;
                            const doseRows = roa.dose ? DOSE_LEVELS.map((l) => ({ ...l, value: fmtDose(roa.dose!, l.key) })).filter((l) => l.value) : [];
                            const durRows = roa.duration ? DUR_FIELDS.map((f) => ({ ...f, value: fmtDur(roa.duration![f.key]) })).filter((f) => f.value) : [];
                            if (!doseRows.length && !durRows.length) return null;
                            return (
                              <div key={roa.name}>
                                <p className="text-[11px] font-bold text-textc/40 uppercase tracking-widest mb-2">{roaLabel}</p>
                                {doseRows.length > 0 && (
                                  <div className="space-y-1 mb-3">
                                    {doseRows.map((l) => (
                                      <div key={l.key} className="flex items-center justify-between">
                                        <span className="text-xs text-textc/50 w-16 flex-shrink-0">{l.label}</span>
                                        <div className="flex-1 mx-2 h-px bg-borderc/30" />
                                        <span className={`text-xs font-semibold tabular-nums ${l.color}`}>{l.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {durRows.length > 0 && (
                                  <div className="space-y-1">
                                    {durRows.map((f) => (
                                      <div key={f.key} className="flex items-center justify-between">
                                        <span className="text-xs text-textc/50 w-16 flex-shrink-0">{f.label}</span>
                                        <div className="flex-1 mx-2 h-px bg-borderc/30" />
                                        <span className="text-xs font-semibold tabular-nums text-textc/70">{f.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Dosage & duration — TripSit */}
              {tripsit && (tripsit.formatted_dose || tripsit.duration) && (
                <motion.div {...item(0.12)} className="mt-3 rounded-2xl border border-borderc/50 overflow-hidden">
                  <button onClick={() => setRoasOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-left" aria-expanded={roasOpen}>
                    <span className="text-xs font-bold text-textc/60 uppercase tracking-widest">Dosering &amp; duur</span>
                    <motion.svg className="w-4 h-4 text-textc/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" animate={{ rotate: roasOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {roasOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-5">
                          {tripsit.formatted_dose && (
                            <div>
                              <p className="text-[11px] font-bold text-textc/40 uppercase tracking-widest mb-2">Dosering</p>
                              <div className="space-y-1">
                                {tripsit.formatted_dose.split('\n').filter(Boolean).map((line, i) => {
                                  const [label, ...rest] = line.split(':');
                                  const value = rest.join(':').trim();
                                  return value ? (
                                    <div key={i} className="flex items-center justify-between">
                                      <span className="text-xs text-textc/50 w-16 flex-shrink-0">{label.trim()}</span>
                                      <div className="flex-1 mx-2 h-px bg-borderc/30" />
                                      <span className="text-xs font-semibold tabular-nums text-textc/70">{value}</span>
                                    </div>
                                  ) : (
                                    <p key={i} className="text-[11px] font-bold text-textc/40 uppercase tracking-widest mt-2 mb-1">{label.trim()}</p>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {tripsit.duration && (
                            <div>
                              <p className="text-[11px] font-bold text-textc/40 uppercase tracking-widest mb-2">Duur</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-textc/50 w-16 flex-shrink-0">Totaal</span>
                                <div className="flex-1 mx-2 h-px bg-borderc/30" />
                                <span className="text-xs font-semibold tabular-nums text-textc/70">{tripsit.duration}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Interactions */}
              {interactions.length > 0 && (
                <motion.div {...item(0.24)} className="mt-3 rounded-2xl border border-borderc/50 overflow-hidden">
                  <button onClick={() => setInteractionsOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-left" aria-expanded={interactionsOpen}>
                    <span className="text-xs font-bold text-textc/60 uppercase tracking-widest">Risicovolle interacties</span>
                    <motion.svg className="w-4 h-4 text-textc/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" animate={{ rotate: interactionsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {interactionsOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-1">
                          {interactions.map((ix) => (
                            <div key={ix.name} className="flex items-center gap-2 min-h-[36px]">
                              <span className="text-sm leading-none" role="img" aria-label={severityLabel(ix.status)}>{severityEmoji(ix.status)}</span>
                              <span className="text-xs text-textc/70 flex-1">{ix.name}</span>
                              <span className="text-[11px] text-textc/40">{severityLabel(ix.status)}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Wiki card */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.a {...item(0.36)} href={wiki.url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-3 px-4 py-3 rounded-2xl border border-borderc/50 bg-bg/40 text-textc/70 hover:bg-bg-hover transition-colors">
                <img
                  src={wiki.source === 'psychonautwiki' ? 'https://www.google.com/s2/favicons?domain=psychonautwiki.org&sz=32' : wiki.source === 'tripsit' ? 'https://www.google.com/s2/favicons?domain=tripsit.me&sz=32' : 'https://www.google.com/s2/favicons?domain=en.wikipedia.org&sz=32'}
                  alt="" width={20} height={20} className="rounded opacity-80 flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="text-sm font-medium flex-1">
                  {wiki.source === 'psychonautwiki' ? 'PsychonautWiki' : wiki.source === 'tripsit' ? 'TripSit' : 'Wikipedia'}
                </span>
                <svg className="w-4 h-4 text-textc/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </motion.a>

              {/* Close button */}
              <div className="mt-5 flex justify-end">
                <motion.button {...item(0.48)} onClick={onClose} className="btn btn-primary" whileTap={{ scale: 0.97 }}>
                  Sluiten
                </motion.button>
              </div>
          </div>
        )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DrugDetails;
