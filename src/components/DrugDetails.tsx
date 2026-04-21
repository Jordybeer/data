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

const DrugDetails = ({ drug, onClose, isAdmin, onNoteUpdate }: DrugDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState(drug.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Scroll lock while open
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

  // No inner AnimatePresence — parent page.tsx wraps this in AnimatePresence
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
        {/* Header */}
        <div className="flex justify-between items-start mb-6 gap-3">
          <div>
            <h2 className="text-2xl font-bold text-primary">{drug.name}</h2>
            <span className="text-xs text-textc/60 bg-bg/60 px-2 py-0.5 rounded-full mt-2 inline-block border border-borderc">
              {drug.category}
            </span>
          </div>
          <motion.button
            onClick={onClose}
            aria-label="Sluiten"
            className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-bg-hover border border-borderc text-textc/60 hover:text-textc transition-colors"
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
              <button onClick={() => setIsEditing(true)} className="text-xs text-primary hover:underline">
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

        <div className="mt-6 flex justify-end">
          <motion.button onClick={onClose} className="btn btn-primary" whileTap={{ scale: 0.97 }}>
            Sluiten
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DrugDetails;
