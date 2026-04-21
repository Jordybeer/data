'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/components/SessionProvider';
import { SearchBar } from '@/components/SearchBar';
import { CategoryList } from '@/components/CategoryList';
import { DrugItem } from '@/components/DrugItem';
import { DisclaimerSection } from '@/components/DisclaimerSection';
import { AuthSection } from '@/components/AuthSection';
import DrugDetails from '@/components/DrugDetails';
import type { Drug } from '@/data/drugs';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 26 } },
};

export default function Home() {
  const { session } = useSession();
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = session.isAdmin;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/drugs', { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data)) setDrugs(data);
      } catch (err) {
        console.error('Error fetching drugs:', err);
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
  const filteredDrugs = drugs.filter((drug) => {
    const q = search.toLowerCase();
    const matchesSearch =
      drug.name.toLowerCase().includes(q) || drug.category.toLowerCase().includes(q);
    const matchesCategory = !category || drug.category === category;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-textc">
        Loading database...
      </div>
    );
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

        <AnimatePresence mode="wait">
          <motion.div
            key={`${search}-${category}`}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredDrugs.map((drug) => (
              <motion.div key={drug.id} variants={itemVariants}>
                <DrugItem
                  drug={drug}
                  onClick={() => setSelectedDrug(drug)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredDrugs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-textc/60"
          >
            No substances found matching your criteria.
          </motion.div>
        )}

        <div className="space-y-6">
          <AuthSection />
          <DisclaimerSection />
        </div>
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
    </div>
  );
}
