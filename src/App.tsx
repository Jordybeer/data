import React, { useEffect, useMemo, useState } from 'react'
import { CATEGORY_ORDER, getAllDrugs } from './data/drugs'
import { Disclaimer } from './components/Disclaimer'
import { SearchBar } from './components/SearchBar'
import { CategoryList } from './components/CategoryList'
import { DrugDetails } from './components/DrugDetails'
import { AuthSection } from './components/AuthSection'
import { PWAPrompt } from './components/PWAPrompt'

export interface Drug {
  id: number
  name: string
  category: string
  notes: string
}

export interface Category {
  name: string
  drugs: Drug[]
}

function App() {
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Drug | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isPushEnabled, setIsPushEnabled] = useState(false)

  useEffect(() => {
    setDrugs(getAllDrugs())
    const handlePrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handlePrompt)
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt)
  }, [])

  const filteredCategories = useMemo(() => {
    const filtered = drugs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))
    return CATEGORY_ORDER.map(name => ({
      name,
      drugs: filtered.filter(d => d.category === name)
    })).filter(c => c.drugs.length > 0)
  }, [drugs, search])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setIsInstallable(false)
  }

  return (
    <div className="min-h-[100dvh] bg-bg text-textc py-6">
      <PWAPrompt isInstallable={isInstallable} onInstall={handleInstall} />
      <div className="max-w-[900px] mx-auto w-full px-4 sm:px-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-1">💊 Psychonaut DB</h1>
          <p className="text-textc/70">Totaal: {drugs.length} substances ✔</p>
        </header>
        <main className="flex flex-col gap-6">
          <Disclaimer />
          <SearchBar value={search} onChange={setSearch} />
          {filteredCategories.length > 0 ? (
            <CategoryList categories={filteredCategories} onDrugClick={setSelected} />
          ) : (
            <div className="bg-bg-light border border-borderc rounded-xl text-center py-12 text-textc/70">
              Geen resultaten
            </div>
          )}
        </main>
        <footer className="mt-10 pt-6 border-t border-borderc">
          <AuthSection isAdmin={isAdmin} onAuthChange={() => setIsAdmin(!isAdmin)} isPushEnabled={isPushEnabled} onPushChange={setIsPushEnabled} />
        </footer>
      </div>
      <DrugDetails drug={selected} isAdmin={isAdmin} onClose={() => setSelected(null)} onSave={(notes) => { if (selected) { setDrugs(prev => prev.map(d => d.id === selected.id ? { ...d, notes } : d)); setSelected({ ...selected, notes }); } }} />
    </div>
  )
}

export default App