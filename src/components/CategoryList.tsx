import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_ORDER } from '@/data/drugs';

interface CategoryListProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, selected, onSelect }) => {
  const sortedCategories = [...categories].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  );

  return (
    <div className="relative mb-6">
      <div
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]"
        style={{ scrollbarWidth: 'none' }}
        role="group"
        aria-label="Filter op categorie"
      >
        {[null, ...sortedCategories].map((cat, i) => (
          <motion.button
            key={cat ?? '__all__'}
            onClick={() => onSelect(cat)}
            aria-pressed={selected === cat}
            className={`btn whitespace-nowrap flex-shrink-0 ${selected === cat ? 'btn-primary' : ''}`}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, type: 'spring' as const, stiffness: 400, damping: 28 }}
          >
            {cat ?? 'Alles'}
          </motion.button>
        ))}
      </div>
      {/* right fade to hint overflow */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-12 bg-gradient-to-l from-[#0b1220] to-transparent" />
    </div>
  );
};
