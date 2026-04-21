import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <input
    type="search"
    placeholder="Zoek stoffen..."
    aria-label="Zoek stoffen"
    className="input w-full"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);
