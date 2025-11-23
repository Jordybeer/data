import { useState } from 'react'
import { Drug } from '../data/drugs'
import DrugDetails from './DrugDetails'

// ✅ UPDATE: Interface to accept admin props
interface DrugItemProps {
  drug: Drug
  isAdmin?: boolean
  onUpdateDrug?: (drug: Drug) => void
}

const DrugItem = ({ drug, isAdmin, onUpdateDrug }: DrugItemProps) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <div 
        onClick={() => setShowDetails(true)}
        className="cursor-pointer p-4 rounded-lg border border-borderc bg-bg hover:border-primary/50 hover:shadow-sm transition-all group"
      >
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-textc group-hover:text-primary transition-colors">
            {drug.name}
          </h3>
        </div>
      </div>

      {showDetails && (
        <DrugDetails 
          drug={drug} 
          onClose={() => setShowDetails(false)}
          // ✅ UPDATE: Pass props down to the modal
          isAdmin={isAdmin}
          onUpdateDrug={onUpdateDrug}
        />
      )}
    </>
  )
}

export default DrugItem
