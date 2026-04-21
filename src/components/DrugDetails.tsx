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

const DrugDetails = ({
  drug,
  onClose,
  isAdmin,
  onNoteUpdate,
}: DrugDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState(drug.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drug_id: String(drug.id),
          content: editNote,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      onNoteUpdate(String(drug.id), editNote);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay show"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="modal show"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary">{drug.name}</h2>
              <span className="text-sm text-textc/60 bg-bg px-2 py-0.5 rounded mt-2 inline-block border border-borderc">
                {drug.category}
              </span>
            </div>
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-bg-hover rounded-full transition-colors text-textc/60 hover:text-textc"
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          <div className="space-y-6">
            <div className="bg-bg/50 p-4 rounded-lg border border-borderc/50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-textc/80 uppercase tracking-wider">
                  Notes
                </h3>
                {isAdmin && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
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
                      className="input w-full min-h-[150px] p-3"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                      placeholder="Enter notes here..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditNote(drug.notes || '');
                        }}
                        className="btn"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn btn-primary"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
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
                    className="text-textc leading-relaxed whitespace-pre-wrap"
                  >
                    {drug.notes || (
                      <span className="text-textc/40 italic">
                        No specific notes recorded for this substance.
                      </span>
                    )}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-borderc flex justify-end">
            <motion.button
              onClick={onClose}
              className="btn btn-primary"
              whileTap={{ scale: 0.97 }}
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DrugDetails;
