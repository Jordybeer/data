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

type WikiResult = { url: string; source: 'psychonautwiki' | 'wikipedia' } | null;

const DrugDetails = ({ drug, onClose, isAdmin, onNoteUpdate }: DrugDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState(drug.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [wiki, setWiki] = useState<WikiResult>(null);

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
      try {
        const res = await fetch('https://api.psychonautwiki.org/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `{ substances(query: ${JSON.stringify(drug.name)}) { name url } }`,
          }),
        });
        const json = await res.json();
        if (cancelled) return;
        const substances: { name: string; url: string }[] = json?.data?.substances ?? [];
        const match = substances.find(
          (s) => s.name.toLowerCase() === drug.name.toLowerCase(),
        );
        if (match?.url) {
          setWiki({ url: match.url, source: 'psychonautwiki' });
        } else {
          setWiki({ url: `https://en.wikipedia.org/wiki/${encodeURIComponent(drug.name)}`, source: 'wikipedia' });
        }
      } catch {
        if (!cancelled) {
          setWiki({ url: `https://en.wikipedia.org/wiki/${encodeURIComponent(drug.name)}`, source: 'wikipedia' });
        }
      }
    })();
    return () => { cancelled = true; };
  }, [drug.name]);

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
        {/* Header — sticky so close button is always reachable */}
        <div className="sticky top-0 z-10 flex justify-between items-start mb-5 gap-3 pb-4 border-b border-borderc/40"
          style={{ background: 'rgba(15,23,42,0.96)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', margin: '-28px -28px 20px', padding: '20px 28px' }}
        >
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-primary leading-snug">{drug.name}</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] font-medium text-primary/80 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                {drug.category}
              </span>
              {drug.category2 && (
                <span className="text-[11px] font-medium text-cyan-300/80 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-md">
                  {drug.category2}
                </span>
              )}
              {wiki && (
                <a
                  href={wiki.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-textc/70 bg-white/[0.07] border border-white/10 px-2 py-0.5 rounded-md hover:text-textc hover:bg-white/[0.12] transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={wiki.source === 'psychonautwiki'
                      ? 'https://www.google.com/s2/favicons?domain=psychonautwiki.org&sz=16'
                      : 'https://www.google.com/s2/favicons?domain=en.wikipedia.org&sz=16'}
                    alt=""
                    width={12}
                    height={12}
                    className="rounded-sm opacity-80"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  Wiki
                </a>
              )}
            </div>
          </div>
          <motion.button
            onClick={onClose}
            aria-label="Sluiten"
            className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl bg-bg-hover border border-borderc text-textc/60 hover:text-textc transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Notes section */}
        <div className="bg-bg/40 p-4 rounded-2xl border border-borderc/50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-textc/60 uppercase tracking-widest">Notities</h3>
            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn text-xs px-3 min-h-[32px]"
              >
                Bewerken
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-3"
              >
                <textarea
                  className="input w-full min-h-[140px] p-3"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Notities hier invoeren..."
                  autoFocus
                />
                {saveError && <p className="text-sm text-red-400">{saveError}</p>}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setIsEditing(false); setEditNote(drug.notes || ''); setSaveError(''); }}
                    className="btn"
                  >
                    Annuleren
                  </button>
                  <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
                    {isSaving ? 'Opslaan...' : 'Opslaan'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.p
                key="viewing"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="text-textc leading-relaxed whitespace-pre-wrap text-sm"
              >
                {drug.notes || (
                  <span className="text-textc/40 italic">Geen notities voor deze stof.</span>
                )}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-5 flex justify-end">
          <motion.button onClick={onClose} className="btn btn-primary" whileTap={{ scale: 0.97 }}>
            Sluiten
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DrugDetails;
