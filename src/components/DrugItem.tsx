import React from 'react';
import { motion } from 'framer-motion';
import { Drug } from '@/data/drugs';

interface DrugItemProps {
  drug: Drug;
  onClick: () => void;
}

export const DrugItem: React.FC<DrugItemProps> = ({ drug, onClick }) => (
  <motion.button
    onClick={onClick}
    className="card p-4 text-left w-full block hover:border-primary/50 transition-all group"
    whileTap={{ scale: 0.97 }}
    whileHover={{ y: -2 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  >
    <div className="flex items-center justify-between gap-2 mb-1">
      <h3 className="font-semibold text-base group-hover:text-primary transition-colors truncate">
        {drug.name}
      </h3>
      <span className="text-xs text-textc/60 bg-bg px-2 py-0.5 rounded border border-borderc flex-shrink-0">
        {drug.category}
      </span>
    </div>
    {drug.notes && (
      <p className="text-sm text-textc/70 line-clamp-2">{drug.notes}</p>
    )}
  </motion.button>
);
