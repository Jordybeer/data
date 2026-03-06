import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => (
  <input
    type="text"
    placeholder="Search substances..."
    className="input w-full"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />
);
