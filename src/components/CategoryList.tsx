import React from 'react';
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
      <button
        onClick={() => onSelect(null)}
        className={`btn whitespace-nowrap ${
          selected === null ? 'btn-primary' : ''
        }`}
      >
        All
      </button>
      {sortedCategories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`btn whitespace-nowrap ${
            selected === cat ? 'btn-primary' : ''
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};
