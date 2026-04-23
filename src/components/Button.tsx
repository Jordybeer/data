'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'danger' | 'chip';
  size?: 'sm' | 'md';
  active?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  active = false,
  className = '',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold select-none cursor-pointer ' +
    'transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ' +
    'active:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

  const sizes: Record<string, string> = {
    sm: 'h-8 px-3 text-sm rounded-xl',
    md: 'h-11 px-[18px] text-[15px] rounded-2xl',
  };

  const variants: Record<string, string> = {
    default: 'bg-white/[0.06] border border-white/10 text-textc',
    primary:
      'bg-[#8b5cf6] border border-[#a78bfa]/20 text-white ' +
      'shadow-[0_4px_16px_rgba(139,92,246,0.30)] hover:bg-[#7c3aed]',
    danger: 'bg-white/[0.06] border border-red-400/20 text-red-400',
    chip: active
      ? 'rounded-full px-4 h-8 text-[13px] font-medium ' +
        'bg-white/[0.11] border border-white/25 text-white ' +
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]'
      : 'rounded-full px-4 h-8 text-[13px] font-medium ' +
        'border border-white/[0.10] text-textc/62',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
