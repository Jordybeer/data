import { useState } from 'react'
// CHANGE THIS LINE:
import { Drug } from '../data/drugs'
import DrugDetails from './DrugDetails'

interface DrugItemProps {
  drug: Drug
}

const DrugItem = ({ drug }: DrugItemProps) => {
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
        />
      )}
    </>
  )
}

export default DrugItem
