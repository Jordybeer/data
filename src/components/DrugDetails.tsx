import { useEffect } from 'react'
// FIX: Import Drug from the new data file
import { Drug } from '../data/drugs'

interface DrugDetailsProps {
  drug: Drug
  onClose: () => void
}

const DrugDetails = ({ drug, onClose }: DrugDetailsProps) => {
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div 
        className="modal show" 
        onClick={e => e.stopPropagation()}
      >
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {drug.notes ? (
            <div className="bg-bg/50 p-4 rounded-lg border border-borderc/50">
              <h3 className="text-sm font-semibold text-textc/80 mb-2 uppercase tracking-wider">
                Notes
              </h3>
              <p className="text-textc leading-relaxed whitespace-pre-wrap">
                {drug.notes}
              </p>
            </div>
          ) : (
            <p className="text-textc/40 italic">No specific notes recorded for this substance.</p>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-borderc flex justify-end">
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default DrugDetails
