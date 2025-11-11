import React, { useEffect, useState } from 'react'
import { Drug } from '../App'
export const DrugDetails: React.FC<{ drug: Drug | null; isAdmin: boolean; onClose: () => void; onSave: (n: string) => void }> = ({ drug, isAdmin, onClose, onSave }) => {
  const [notes, setNotes] = useState('')
  const [open, setOpen] = useState(false)
  useEffect(() => { if (drug) { setNotes(drug.notes || ''); setOpen(true); } else { setOpen(false); } }, [drug])
  const save = () => { setTimeout(() => { onSave(notes); }, 300); }
  const close = () => { setOpen(false); setTimeout(() => onClose(), 300); }
  if (!drug) return null
  return <><div className={`modal-overlay ${open ? 'show' : ''}`} onClick={close} /><div className={`modal ${open ? 'show' : ''}`}><button className="absolute top-3 right-3 text-textc/60 hover:text-textc w-8 h-8 flex items-center justify-center" onClick={close}>✕</button><div className="pr-8"><h2 className="text-xl font-semibold mb-4">{drug.name}</h2><div className="flex flex-col gap-3"><label className="text-sm font-semibold">Notities:</label>{isAdmin ? <><textarea className="input min-h-[150px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Voeg notities toe..." /><div className="flex gap-3"><button className="btn btn-primary" onClick={save}>💾 Opslaan</button><button className="btn btn-muted" onClick={close}>Sluiten</button></div></> : <div className="px-4 py-3 bg-bg border border-borderc rounded-lg text-textc/70 min-h-[100px]">{notes || 'Geen notities'}</div>}</div></div></div></> 
}