import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <div className="relative">
    <svg
      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textc/35 pointer-events-none"
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
    </svg>
    <input
      type="search"
      placeholder="Zoek stoffen..."
      aria-label="Zoek stoffen"
      className="input w-full pl-10"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
