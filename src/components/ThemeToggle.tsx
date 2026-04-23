'use client';

import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Schakel naar lichtmodus' : 'Schakel naar donkermodus'}
      className="relative flex items-center w-14 h-7 rounded-full border border-white/15 bg-white/8 backdrop-blur-sm flex-shrink-0"
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className={`absolute ${isDark ? 'left-1' : 'left-7'} w-5 h-5 rounded-full flex items-center justify-center text-[11px]`}
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #818cf8, #6366f1)'
            : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          boxShadow: isDark
            ? '0 2px 8px rgba(99,102,241,0.5)'
            : '0 2px 8px rgba(251,191,36,0.5)',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </motion.span>
    </button>
  );
}
