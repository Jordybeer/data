import { useState, useEffect } from 'react'
import { SearchBar } from './components/SearchBar'
import { CategoryList } from './components/CategoryList'
import { DrugItem } from './components/DrugItem'
import { DisclaimerSection } from './components/DisclaimerSection'
import { AuthSection } from './components/AuthSection'
import DrugDetails from './components/DrugDetails'
import PWAPrompt from './components/PWAPrompt'
import { drugs as initialDrugs, Drug } from './data/drugs'
import { supabase } from './lib/supabase'

export default function App() {
  const [drugs, setDrugs] = useState<Drug[]>(initialDrugs)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
  const [isPushEnabled, setIsPushEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check auth and fetch global notes on load
  useEffect(() => {
    const initializeApp = async () => {
      // 1. Check Auth
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserEmail(session.user.email)
        setIsAdmin(session.user.email === 'contact@jordy.beer')
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUserEmail(session.user.email)
          setIsAdmin(session.user.email === 'contact@jordy.beer')
        } else {
          setUserEmail(undefined)
          setIsAdmin(false)
        }
      })

      // 2. Fetch Global Notes
      try {
        const { data: notes, error } = await supabase
          .from('notes')
          .select('drug_id, content')

        if (!error && notes) {
          setDrugs(currentDrugs => 
            currentDrugs.map(drug => {
              const note = notes.find(n => n.drug_id === (drug.id || drug.name))
              return note ? { ...drug, notes: note.content } : drug
            })
          )
        }
      } catch (err) {
        console.error('Error fetching notes:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  const handleNoteUpdate = (drugId: string, newNote: string) => {
    setDrugs(currentDrugs => 
      currentDrugs.map(drug => 
        (drug.id || drug.name) === drugId ? { ...drug, notes: newNote } : drug
      )
    )
    if (selectedDrug && (selectedDrug.id || selectedDrug.name) === drugId) {
      setSelectedDrug({ ...selectedDrug, notes: newNote })
    }
  }

  const categories = Array.from(new Set(drugs.map(d => d.category)))
  
  const filteredDrugs = drugs.filter(drug => {
    const matchesSearch = drug.name.toLowerCase().includes(search.toLowerCase()) ||
                         drug.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !category || drug.category === category
    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-textc">Loading database...</div>
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-card border-b border-borderc sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-primary">
              <span className="text-textc">Psychonaut</span> DB
            </h1>
          </div>
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <CategoryList 
          categories={categories} 
          selected={category} 
          onSelect={setCategory} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {filteredDrugs.map(drug => (
            <DrugItem 
              key={drug.id || drug.name} 
              drug={drug} 
              onClick={() => setSelectedDrug(drug)}
            />
          ))}
        </div>
        {filteredDrugs.length === 0 && (
          <div className="text-center py-12 text-textc/60">
            No substances found matching your criteria.
          </div>
        )}

        <div className="space-y-6">
          <AuthSection 
            isAdmin={isAdmin} 
            userEmail={userEmail}
            onAuthChange={() => {}} 
            isPushEnabled={isPushEnabled} 
            onPushChange={setIsPushEnabled} 
          />
          <DisclaimerSection />
        </div>
      </main>

      {selectedDrug && (
        <DrugDetails 
          drug={selectedDrug} 
          onClose={() => setSelectedDrug(null)}
          isAdmin={isAdmin}
          onNoteUpdate={handleNoteUpdate}
        />
      )}
      
      <PWAPrompt />
    </div>
  )
}
