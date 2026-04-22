import React from 'react';
import { CATEGORY_ORDER } from '@/data/drugs';

interface CategoryListProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
  label?: string;
  variant?: 'segment' | 'wrap';
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selected,
  onSelect,
  label,
  variant = 'wrap',
}) => {
  const sorted = [...categories].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b),
  );
  const options = [null, ...sorted];

  if (variant === 'segment') {
    return (
      <div
        role="group"
        aria-label={label ?? 'Filter op categorie'}
        className="flex rounded-[14px] bg-white/[0.05] border border-white/[0.07] p-[3px] gap-[3px]"
      >
        {options.map((cat) => (
          <button
            key={cat ?? '__all__'}
            role="radio"
            aria-checked={selected === cat}
            onClick={() => onSelect(cat)}
            className={
              'flex-1 h-8 rounded-[11px] text-[13px] font-medium transition-all duration-150 ' +
              (selected === cat
                ? 'bg-white/[0.13] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
                : 'text-textc/50 active:bg-white/[0.05]')
            }
          >
            {cat ?? 'Alles'}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={label ?? 'Filter op subcategorie'}
      className="flex flex-wrap gap-1.5"
    >
      {options.map((cat) => (
        <button
          key={cat ?? '__all__'}
          role="radio"
          aria-checked={selected === cat}
          onClick={() => onSelect(cat)}
          className={
            'h-7 px-3 rounded-full text-[12px] font-medium transition-all duration-150 ' +
            (selected === cat
              ? 'bg-white/[0.11] border border-white/20 text-white'
              : 'border border-white/[0.09] text-textc/50 active:bg-white/[0.05]')
          }
        >
          {cat ?? 'Alles'}
        </button>
      ))}
    </div>
  );
};
