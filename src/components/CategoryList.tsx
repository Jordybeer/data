import { useState } from 'react'
// FIX 1: Import types from the new location
import { Drug, CATEGORY_ORDER } from '../data/drugs'
import DrugItem from './DrugItem'

interface CategoryListProps {
  drugs: Drug[]
}

const CategoryList = ({ drugs }: CategoryListProps) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  // Group drugs by category
  const drugsByCategory = drugs.reduce((acc, drug) => {
    if (!acc[drug.category]) {
      acc[drug.category] = []
    }
    acc[drug.category].push(drug)
    return acc
  }, {} as Record<string, Drug[]>)

  return (
    <div className="space-y-4">
      {CATEGORY_ORDER.map((category) => {
        const categoryDrugs = drugsByCategory[category] || []
        // Skip empty categories if you want, or keep them
        if (categoryDrugs.length === 0) return null

        return (
          <div key={category} className="border border-borderc rounded-xl overflow-hidden bg-bg-light">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-6 py-4 flex items-center justify-between bg-bg-light hover:bg-bg-hover transition-colors text-left"
            >
              <span className="text-lg font-semibold text-textc">{category}</span>
              <span className="text-sm text-textc/60 bg-bg px-2 py-1 rounded-md">
                {categoryDrugs.length}
              </span>
            </button>
            
            {expandedCategory === category && (
              <div className="px-6 pb-6 pt-2 grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {categoryDrugs.map((drug) => (
                  <DrugItem key={drug.id} drug={drug} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CategoryList
