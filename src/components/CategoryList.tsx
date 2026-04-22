import React from 'react';
import { CATEGORY_ORDER } from '@/data/drugs';

interface CategoryListProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
  label?: string;
  variant?: 'segment' | 'wrap';
}

// Display rename without touching the DB
const DISPLAY: Record<string, string> = {
  'Research chemicals': 'NPS',
};
const displayLabel = (cat: string | null) => cat ? (DISPLAY[cat] ?? cat) : 'Alles';

const SEGMENT_ACTIVE: Record<string, string> = {
  __all__:              'bg-white/[0.12] text-white',
  'Street drugs':       'bg-amber-400/[0.18] text-amber-300',
  'Research chemicals': 'bg-sky-400/[0.18] text-sky-300',
};

const CHIP_ACTIVE: Record<string, string> = {
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
                  ? (SEGMENT_ACTIVE[key] ?? SEGMENT_ACTIVE.__all__)
                  : 'text-textc/50 active:bg-black/[0.04] dark:active:bg-white/[0.05]')
              }
            >
              {displayLabel(cat)}
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
              'h-6 px-2.5 rounded-full text-[11px] font-medium transition-all duration-150 border ' +
              (isActive
                ? (CHIP_ACTIVE[key] ?? 'bg-primary/[0.18] border-primary/30 text-primary')
                : 'border-black/[0.12] dark:border-white/[0.09] text-textc/50 active:bg-black/[0.04] dark:active:bg-white/[0.05]')
            }
          >
            {displayLabel(cat)}
          </button>
        );
      })}
    </div>
  );
};
