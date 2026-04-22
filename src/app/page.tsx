'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSession } from '@/components/SessionProvider';
import { SearchBar } from '@/components/SearchBar';
import { CategoryList } from '@/components/CategoryList';
import { DrugItem } from '@/components/DrugItem';
import { DisclaimerSection } from '@/components/DisclaimerSection';
import { AuthSection } from '@/components/AuthSection';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ScrollToTop } from '@/components/ScrollToTop';
import DrugDetails from '@/components/DrugDetails';
import type { Drug } from '@/data/drugs';

export default function Home() {
  const { session } = useSession();
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [category2, setCategory2] = useState<string | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const isAdmin = session.isAdmin;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/drugs', { cache: 'no-store' });
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) setDrugs(data);
        else setFetchError(true);
      } catch {
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleNoteUpdate = (drugId: string, newNote: string) => {
    setDrugs((cur) =>
      cur.map((d) => (String(d.id) === drugId ? { ...d, notes: newNote } : d)),
    );
    if (selectedDrug && String(selectedDrug.id) === drugId) {
      setSelectedDrug({ ...selectedDrug, notes: newNote });
    }
  };

  const categories = Array.from(new Set(drugs.map((d) => d.category)));
  const categories2 = Array.from(new Set(drugs.map((d) => d.category2).filter(Boolean))) as string[];

  const filteredDrugs = drugs.filter((drug) => {
    const q = search.toLowerCase();
    const matchesSearch =
      drug.name.toLowerCase().includes(q) ||
      drug.category.toLowerCase().includes(q) ||
      (drug.category2 ?? '').toLowerCase().includes(q);
    const matchesCategory = !category || drug.category === category;
    const matchesCategory2 = !category2 || drug.category2 === category2;
    return matchesSearch && matchesCategory && matchesCategory2;
  });

  if (isLoading) return <LoadingScreen />;

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-textc/60">
        Kon stoffen niet laden — database niet beschikbaar.
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="pd-stickyHeader">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-bold">
              <span className="text-textc">Psychonaut</span>{' '}
              <span className="text-primary">DB</span>
            </h1>
          </div>
          <SearchBar value={search} onChange={setSearch} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-5">
        <DisclaimerSection />

        <div className="space-y-3">
          <CategoryList
            categories={categories}
            selected={category}
            onSelect={setCategory}
            label="Categorie"
          />
          {categories2.length > 0 && (
            <CategoryList
              categories={categories2}
              selected={category2}
              onSelect={setCategory2}
              label="Subcategorie"
            />
          )}
        </div>

        {(search || category || category2) && filteredDrugs.length > 0 && (
          <p className="text-xs text-textc/40 -mb-1">{filteredDrugs.length} resultaten</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrugs.map((drug) => (
            <DrugItem key={drug.id} drug={drug} onClick={() => setSelectedDrug(drug)} />
          ))}
        </div>

        {filteredDrugs.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <p className="text-textc/60">Geen stoffen gevonden.</p>
            {(search || category || category2) && (
              <button
                onClick={() => { setSearch(''); setCategory(null); setCategory2(null); }}
                className="btn text-sm"
              >
                Filters wissen
              </button>
            )}
          </div>
        )}

        <AuthSection />
      </main>

      <AnimatePresence>
        {selectedDrug && (
          <DrugDetails
            drug={selectedDrug}
            onClose={() => setSelectedDrug(null)}
            isAdmin={isAdmin}
            onNoteUpdate={handleNoteUpdate}
          />
        )}
      </AnimatePresence>

      <ScrollToTop />
    </div>
  );
}
