import { useState, useMemo, useEffect } from 'react'
import { getAllDrugs } from './data/drugs'
import CategoryList from './components/CategoryList'
import DisclaimerSection from './components/DisclaimerSection'

// ✅ Named Imports (Fixes "No default export" errors)
import { AuthSection } from './components/AuthSection'
import { PWAPrompt } from './components/PWAPrompt'

function App() {
  const [search, setSearch] = useState('')
  
  // --- Auth State ---
  const [isAdmin, setIsAdmin] = useState(false)
  const [isPushEnabled, setIsPushEnabled] = useState(false)

  // --- PWA Install State (New Logic) ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = () => {
    if (!deferredPrompt) return
    // Show the install prompt
    deferredPrompt.prompt()
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
      }
      setDeferredPrompt(null)
    })
  }

  // --- Data Logic ---
  const drugs = useMemo(() => getAllDrugs(), [])

  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug) => 
      drug.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [drugs, search])

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
            <svg 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textc/40"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </header>

        <main>
          {filteredDrugs.length > 0 ? (
            <CategoryList drugs={filteredDrugs} />
          ) : (
            <div className="text-center py-12 text-textc/50 italic">
              No substances found matching "{search}"
            </div>
          )}
        </main>

        <footer className="pt-8 mt-12 border-t border-borderc/50">
          {/* ✅ AuthSection with required props */}
          <AuthSection 
            isAdmin={isAdmin}
            onAuthChange={() => setIsAdmin(!isAdmin)}
            isPushEnabled={isPushEnabled}
            onPushChange={(b) => setIsPushEnabled(b)}
          />

          {/* ✅ PWAPrompt with required props */}
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
