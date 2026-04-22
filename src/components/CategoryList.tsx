import React from 'react';
import { CATEGORY_ORDER } from '@/data/drugs';

interface CategoryListProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
  label?: string;
  variant?: 'segment' | 'wrap';
}

// Per-category accent: bg, text, glow
const SEGMENT_COLORS: Record<string, string> = {
  __all__:              'bg-white/[0.12] text-white shadow-[0_1px_8px_rgba(255,255,255,0.08)]',
  'Street drugs':       'bg-amber-400/[0.18] text-amber-300 shadow-[0_1px_10px_rgba(251,191,36,0.18)]',
  'Research chemicals': 'bg-sky-400/[0.18] text-sky-300 shadow-[0_1px_10px_rgba(56,189,248,0.18)]',
};

const CHIP_COLORS: Record<string, string> = {
  __all__:              'bg-white/[0.10] border-white/20 text-white',
  'Street drugs':       'bg-amber-400/[0.13] border-amber-400/25 text-amber-300',
  'Research chemicals': 'bg-sky-400/[0.13] border-sky-400/25 text-sky-300',
};

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
        {options.map((cat) => {
          const key = cat ?? '__all__';
          const isActive = selected === cat;
          return (
            <button
              key={key}
              role="radio"
              aria-checked={isActive}
              onClick={() => onSelect(cat)}
              className={
                'flex-1 h-8 rounded-[11px] text-[13px] font-medium transition-all duration-150 ' +
                (isActive
                  ? (SEGMENT_COLORS[key] ?? SEGMENT_COLORS.__all__)
                  : 'text-textc/50 active:bg-white/[0.05]')
              }
            >
              {cat ?? 'Alles'}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={label ?? 'Filter op subcategorie'}
      className="flex flex-wrap gap-1.5"
    >
      {options.map((cat) => {
        const key = cat ?? '__all__';
        const isActive = selected === cat;
        return (
          <button
            key={key}
            role="radio"
            aria-checked={isActive}
            onClick={() => onSelect(cat)}
            className={
              'h-7 px-3 rounded-full text-[12px] font-medium transition-all duration-150 border ' +
              (isActive
                ? (CHIP_COLORS[key] ?? 'bg-primary/[0.18] border-primary/30 text-primary')
                : 'border-white/[0.09] text-textc/50 active:bg-white/[0.05]')
            }
          >
            {cat ?? 'Alles'}
          </button>
        );
      })}
    </div>
  );
};
