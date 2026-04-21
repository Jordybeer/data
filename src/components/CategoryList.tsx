import React from 'react';
import { CATEGORY_ORDER } from '@/data/drugs';
import { Button } from '@/components/Button';

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
    <div
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      role="group"
      aria-label="Filter op categorie"
    >
      {[null, ...sortedCategories].map((cat) => (
        <Button
          key={cat ?? '__all__'}
          variant="chip"
          size="sm"
          active={selected === cat}
          aria-pressed={selected === cat}
          onClick={() => onSelect(cat)}
          className="whitespace-nowrap flex-shrink-0"
        >
          {cat ?? 'Alles'}
        </Button>
      ))}
    </div>
  );
};
