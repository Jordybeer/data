import React from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_ORDER } from '@/data/drugs';

interface CategoryListProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selected,
  onSelect,
}) => {
  const sortedCategories = [...categories].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
  );

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {[null, ...sortedCategories].map((cat, i) => (
        <motion.button
          key={cat ?? '__all__'}
          onClick={() => onSelect(cat)}
          className={`btn whitespace-nowrap ${selected === cat ? 'btn-primary' : ''}`}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 28 }}
        >
          {cat ?? 'All'}
        </motion.button>
      ))}
    </div>
  );
};
