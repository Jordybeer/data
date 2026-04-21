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
      'card p-4 text-left w-full block transition-all duration-200 group ' +
      'hover:border-blue-400/25 hover:bg-[rgba(20,40,80,0.55)] ' +
      'active:scale-[0.98] active:brightness-95'
    }
  >
    <div className="flex items-center justify-between gap-2 mb-1">
      <h3 className="font-semibold text-base text-textc group-hover:text-primary transition-colors truncate">
        {drug.name}
      </h3>
      <span className="text-[11px] font-medium text-primary/80 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg flex-shrink-0">
        {drug.category}
      </span>
      {drug.category2 && (
        <span className="text-[11px] font-medium text-blue-300/80 bg-blue-400/10 border border-blue-400/20 px-2 py-0.5 rounded-lg flex-shrink-0">
          {drug.category2}
        </span>
      )}
    </div>
    {drug.notes && (
      <p className="text-sm text-textc/60 line-clamp-2 mt-1">{drug.notes}</p>
    )}
  </button>
);
