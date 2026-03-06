import React from 'react';
import { Drug } from '@/data/drugs';

interface DrugItemProps {
  drug: Drug;
  onClick: () => void;
}

export const DrugItem: React.FC<DrugItemProps> = ({ drug, onClick }) => (
  <button
    onClick={onClick}
    className="card p-4 text-left hover:border-primary/50 transition-all group"
  >
    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
      {drug.name}
    </h3>
    <span className="text-xs text-textc/60 bg-bg px-2 py-0.5 rounded border border-borderc inline-block">
      {drug.category}
    </span>
    {drug.notes && (
      <p className="text-sm text-textc/70 mt-2 line-clamp-2">{drug.notes}</p>
    )}
  </button>
);
