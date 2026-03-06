'use client';

import { useEffect, useState } from 'react';
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
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal show" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary">{drug.name}</h2>
            <span className="text-sm text-textc/60 bg-bg px-2 py-0.5 rounded mt-2 inline-block border border-borderc">
              {drug.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-hover rounded-full transition-colors text-textc/60 hover:text-textc"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
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

            {isEditing ? (
              <div className="flex flex-col gap-3">
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
              </div>
            ) : (
              <p className="text-textc leading-relaxed whitespace-pre-wrap">
                {drug.notes || (
                  <span className="text-textc/40 italic">
                    No specific notes recorded for this substance.
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-borderc flex justify-end">
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrugDetails;
