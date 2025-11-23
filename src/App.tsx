import { useState, useMemo, useEffect } from 'react'
import { getAllDrugs } from './data/drugs'
import CategoryList from './components/CategoryList'
import DisclaimerSection from './components/DisclaimerSection'
import { AuthSection } from './components/AuthSection'
import { PWAPrompt } from './components/PWAPrompt'

function App() {
  const [search, setSearch] = useState('')
  
  // ✅ 1. Persist Admin Login
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('safari_admin') === 'true'
  })
  
  const handleAuthChange = () => {
    const newState = !isAdmin
    setIsAdmin(newState)
    localStorage.setItem('safari_admin', String(newState))
  }

  // ✅ 2. Persist Push State
  const [isPushEnabled, setIsPushEnabled] = useState(() => {
    return localStorage.getItem('safari_push') === 'true'
  })
  
  const handlePushChange = (enabled: boolean) => {
    setIsPushEnabled(enabled)
    localStorage.setItem('safari_push', String(enabled))
  }

  // ✅ 3. Load Data from LocalStorage (or fallback to default)
  const [drugs, setDrugs] = useState(() => {
    const savedData = localStorage.getItem('safari_data')
    if (savedData) {
      return JSON.parse(savedData)
    }
    return getAllDrugs()
  })

  // ✅ 4. Function to Save Edits
  const handleUpdateDrug = (updatedDrug: any) => {
    const newDrugs = drugs.map((d: any) => 
      d.name === updatedDrug.name ? updatedDrug : d
    )
    setDrugs(newDrugs)
    localStorage.setItem('safari_data', JSON.stringify(newDrugs))
  }

  // Filter logic
  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug: any) => 
      drug.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [drugs, search])

  // PWA Logic
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(() => setDeferredPrompt(null))
  }

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <header className="space-y-6">
          <h1 className="text-4xl font-bold text-primary text-center tracking-tight">
            Subconscious Safari
          </h1>
          <DisclaimerSection />
          <div className="relative">
            <input
              type="text"
              placeholder="Search substances..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input w-full pl-12"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textc/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </header>

        <main>
          {filteredDrugs.length > 0 ? (
            <CategoryList 
              drugs={filteredDrugs} 
              isAdmin={isAdmin}           // 👈 CRITICAL: Pass admin state
              onUpdateDrug={handleUpdateDrug} // 👈 CRITICAL: Pass save function
            />
          ) : (
            <div className="text-center py-12 text-textc/50 italic">
              No substances found matching "{search}"
            </div>
          )}
        </main>

        <footer className="pt-8 mt-12 border-t border-borderc/50">
          <AuthSection 
            isAdmin={isAdmin}
            onAuthChange={handleAuthChange}
            isPushEnabled={isPushEnabled}
            onPushChange={handlePushChange}
          />
          <PWAPrompt 
            isInstallable={!!deferredPrompt} 
            onInstall={handleInstallClick} 
          />
        </footer>
      </div>
    </div>
  )
}

export default App
