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

interface TripSitData {
  dose?: Record<string, Record<string, string>>;
  duration?: Record<string, string>;
  onset?: Record<string, string>;
  summary?: string;
}
interface Interaction { name: string; status: string; note?: string; }

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
  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState(drug.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [wiki, setWiki] = useState<WikiResult>(null);
  const [roas, setRoas] = useState<Roa[] | null>(null);
  const [tripsit, setTripsit] = useState<TripSitData | null>(null);
  const [roasOpen, setRoasOpen] = useState(false);
  const [tripsitOpen, setTripsitOpen] = useState(false);
  const [interactions, setInteractions] = useState<Interaction[] | null>(null);
  const [interactionsOpen, setInteractionsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

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
          setTripsit({
            dose: entry.formatted_dose,
            duration: entry.formatted_duration,
            onset: entry.formatted_onset,
            summary: entry.properties?.summary,
          });
          setRoas([]);
          const combos: Record<string, { status: string; note?: string }> = entry.combos ?? {};
          setInteractions(Object.entries(combos).map(([name, v]) => ({ name, status: v.status ?? '', note: v.note })));
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

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const } },
  };

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

  const hasNotes = !!(drug.notes?.trim() || tripsit?.summary);

  return (
    <motion.div
      className="pd-modalOverlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="pd-modal flex flex-col max-h-[95dvh] overflow-hidden p-0"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 30 }}
      >
        {/* Header */}
        <div className="pd-modalStickyHeader flex justify-between items-start gap-3 px-4 py-4 sm:px-6 shrink-0 border-b border-white/[0.07]">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold text-primary leading-snug">{drug.name}</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-sm font-medium text-primary/80 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                {drug.category}
              </span>
              {drug.category2 && (
                <span className="text-sm font-medium text-sky-300/80 bg-sky-400/10 border border-sky-400/20 px-3 py-1 rounded-full">
                  {drug.category2}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-6 sm:px-6">

          {/* Notes — collapsible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const }}
            className="rounded-2xl border border-violet-500/25 bg-violet-500/[0.07] overflow-hidden"
          >
            <button
              onClick={() => setNotesOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-left"
              aria-expanded={notesOpen}
            >
              <span className="text-xs font-bold text-violet-300/80 uppercase tracking-widest">Notities</span>
              <div className="flex items-center gap-2">
                {isAdmin && !isEditing && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); setNotesOpen(true); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); setIsEditing(true); setNotesOpen(true); } }}
                    className="btn text-xs px-3 min-h-[32px] h-8"
                  >
                    Bewerken
                  </span>
                )}
                <motion.svg
                  className="w-4 h-4 text-textc/40 flex-shrink-0"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  animate={{ rotate: notesOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </div>
            </button>
            <AnimatePresence initial={false}>
              {notesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-3 bg-bg/40">
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
                          {hasNotes
                            ? (drug.notes || tripsit?.summary)
                            : <span className="text-textc/40 italic">Geen notities voor deze stof.</span>}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Skeleton while API loads */}
          {(wiki === null || interactions === null) && (
            <div className="mt-3 space-y-3 animate-pulse">
              <div className="h-12 rounded-2xl bg-white/5" />
              <div className="h-12 rounded-2xl bg-white/5" />
            </div>
          )}

          {/* API sections */}
          {wiki !== null && interactions !== null && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible">

              {/* Dosage & duration — PsychonautWiki */}
              {roas !== null && roas.length > 0 && (
                <motion.div variants={sectionVariants} className="mt-3 rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] overflow-hidden">
                  <button onClick={() => setRoasOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-left" aria-expanded={roasOpen}>
                    <span className="text-xs font-bold text-indigo-300/80 uppercase tracking-widest">Dosering &amp; duur</span>
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
                                        <span className="text-xs text-textc/45 w-16 flex-shrink-0">{l.label}</span>
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
                                        <span className="text-xs text-textc/45 w-16 flex-shrink-0">{f.label}</span>
                                        <div className="flex-1 mx-2 h-px bg-borderc/30" />
                                        <span className="text-xs font-semibold tabular-nums text-textc/85">{f.value}</span>
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
              {tripsit && (tripsit.dose || tripsit.duration || tripsit.onset) && (
                <motion.div variants={sectionVariants} className="mt-3 rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] overflow-hidden">
                  <button onClick={() => setTripsitOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-left" aria-expanded={tripsitOpen}>
                    <span className="text-xs font-bold text-indigo-300/80 uppercase tracking-widest">Dosering &amp; duur</span>
                    <motion.svg className="w-4 h-4 text-textc/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" animate={{ rotate: tripsitOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {tripsitOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-4">
                          {tripsit.dose && Object.entries(tripsit.dose).map(([route, levels]) => (
                            <div key={route}>
                              <p className="text-[11px] font-bold text-textc/40 uppercase tracking-widest mb-2">{route}</p>
                              <div className="space-y-1">
                                {Object.entries(levels).map(([level, value]) => (
                                  <div key={level} className="flex items-center justify-between">
                                    <span className="text-xs text-textc/45 w-16 flex-shrink-0">{level}</span>
                                    <div className="flex-1 mx-2 h-px bg-borderc/30" />
                                    <span className="text-xs font-semibold tabular-nums text-textc/85">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          {(tripsit.duration || tripsit.onset) && (
                            <div>
                              <p className="text-[11px] font-bold text-textc/40 uppercase tracking-widest mb-2">Timing</p>
                              <div className="space-y-1">
                                {tripsit.onset && Object.entries(tripsit.onset).filter(([k]) => k !== '_unit').map(([route, val]) => (
                                  <div key={`onset-${route}`} className="flex items-center justify-between">
                                    <span className="text-xs text-textc/45 w-24 flex-shrink-0">Onset {route}</span>
                                    <div className="flex-1 mx-2 h-px bg-borderc/30" />
                                    <span className="text-xs font-semibold tabular-nums text-textc/85">{val} {tripsit.onset!['_unit'] ?? 'min'}</span>
                                  </div>
                                ))}
                                {tripsit.duration && Object.entries(tripsit.duration).filter(([k]) => k !== '_unit').map(([route, val]) => (
                                  <div key={`dur-${route}`} className="flex items-center justify-between">
                                    <span className="text-xs text-textc/45 w-24 flex-shrink-0">Duur {route}</span>
                                    <div className="flex-1 mx-2 h-px bg-borderc/30" />
                                    <span className="text-xs font-semibold tabular-nums text-textc/85">{val} {tripsit.duration!['_unit'] ?? 'u'}</span>
                                  </div>
                                ))}
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
                <motion.div variants={sectionVariants} className="mt-3 rounded-2xl border border-rose-500/25 bg-rose-500/[0.07] overflow-hidden">
                  <button onClick={() => setInteractionsOpen((o) => !o)} className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-left" aria-expanded={interactionsOpen}>
                    <span className="text-xs font-bold text-rose-300/80 uppercase tracking-widest">Risicovolle interacties</span>
                    <motion.svg className="w-4 h-4 text-textc/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" animate={{ rotate: interactionsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence initial={false}>
                    {interactionsOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-1">
                          {interactions.map((ix) => (
                            <div key={ix.name} className="py-1">
                              <div className="flex items-center gap-2 min-h-[44px]">
                                <span className="text-sm leading-none" role="img" aria-label={severityLabel(ix.status)}>{severityEmoji(ix.status)}</span>
                                <span className="text-xs text-textc/70 flex-1">{ix.name}</span>
                                <span className="text-xs text-textc/70">{severityLabel(ix.status)}</span>
                              </div>
                              {ix.note && <p className="text-[11px] text-textc/50 leading-relaxed pb-1 pl-6">{ix.note}</p>}
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
              <motion.a variants={sectionVariants} href={wiki.url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-3 px-4 py-3 rounded-2xl border border-sky-500/25 bg-sky-500/[0.07] text-textc/70 hover:bg-sky-500/[0.12] transition-colors">
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

            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-4 py-4 sm:px-6 shrink-0 border-t border-white/[0.08]">
          <button onClick={onClose} className="btn">Sluiten</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DrugDetails;
