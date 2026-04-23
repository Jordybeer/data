import React from 'react';
import { Drug } from '@/data/drugs';

interface DrugItemProps {
  drug: Drug;
  onClick: () => void;
}

export const DrugItem: React.FC<DrugItemProps> = ({ drug, onClick }) => (
  <button
    onClick={onClick}
    className={
      'card p-4 text-left w-full transition-all duration-200 group min-h-[88px] ' +
      'active:scale-[0.98] active:brightness-95'
    }
  >
    <h3 className="font-semibold text-base text-textc mb-2 leading-snug">
      {drug.name}
    </h3>
    <div className="flex flex-wrap gap-1.5">
      <span className="text-[11px] font-medium text-primary/80 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
        {drug.category}
      </span>
      {drug.category2 && (
        <span className="text-[11px] font-medium text-cyan-300/80 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-md">
          {drug.category2}
        </span>
      )}
    </div>
    {drug.notes && (
      <p className="text-sm text-textc/65 line-clamp-2 mt-2">{drug.notes}</p>
    )}
  </button>
);
