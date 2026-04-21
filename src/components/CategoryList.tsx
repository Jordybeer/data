import React from 'react';
import { CATEGORY_ORDER } from '@/data/drugs';
import { Button } from '@/components/Button';

interface CategoryListProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
  label?: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, selected, onSelect, label }) => {
  const sortedCategories = [...categories].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  );

  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-[11px] font-semibold text-textc/35 uppercase tracking-widest px-0.5">{label}</p>
      )}
      <div
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
        role="group"
        aria-label={label ?? 'Filter op categorie'}
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
    </div>
  );
};
