import { useState, useMemo } from 'react'
import { getAllDrugs, CATEGORY_ORDER, Drug } from './data/drugs'
// Import the new component
import DisclaimerSection from './components/DisclaimerSection'

function App() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const drugs = useMemo(() => getAllDrugs(), [])

  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug) => {
      const matchesSearch = drug.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = selectedCategory ? drug.category === selectedCategory : true
      return matchesSearch && matchesCategory
    })
  }, [drugs, search, selectedCategory])

  const groupedDrugs = useMemo(() => {
    const groups: Record<string, Drug[]> = {}
    
    // Initialize groups based on order preference
    CATEGORY_ORDER.forEach(cat => { groups[cat] = [] })
    
    // Sort drugs into groups
    filteredDrugs.forEach(drug => {
      if (!groups[drug.category]) groups[drug.category] = []
      groups[drug.category].push(drug)
    })

    return groups
  }, [filteredDrugs])

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header & Search */}
        <header className="space-y-6">
          <h1 className="text-4xl font-bold text-primary text-center tracking-tight">
            Drug Tier List
          </h1>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search substances..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
            
            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`btn ${!selectedCategory ? 'btn-primary' : 'btn-muted'}`}
              >
                All
              </button>
              {CATEGORY_ORDER.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                  className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-muted'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content List */}
        <main className="space-y-8">
          {CATEGORY_ORDER.map(category => {
            const categoryDrugs = groupedDrugs[category]
            if (!categoryDrugs?.length) return null

            return (
              <section key={category} className="space-y-4">
                <h2 className="text-xl font-semibold text-textc/80 border-b border-borderc pb-2">
                  {category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryDrugs.map(drug => (
                    <div key={drug.id} className="card p-4 hover:border-primary/50 transition-colors">
                      <div className="font-medium text-textc">{drug.name}</div>
                      {drug.notes && (
                        <div className="text-sm text-textc/60 mt-1">{drug.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )
          })}

          {filteredDrugs.length === 0 && (
            <div className="text-center py-12 text-textc/50">
              No substances found matching your search.
            </div>
          )}
        </main>

        {/* Footer: Disclaimer & Links */}
        <footer className="pt-8 mt-12 border-t border-borderc/50">
          <DisclaimerSection />
        </footer>
      </div>
    </div>
  )
}

export default App
