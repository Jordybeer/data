'use client';

import { useEffect, useState } from 'react';

export const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Naar boven"
      className={
        'fixed bottom-6 right-5 z-[150] w-11 h-11 rounded-2xl ' +
        'flex items-center justify-center ' +
        'border border-white/10 bg-[rgba(14,26,52,0.72)] ' +
        'backdrop-blur-xl text-textc/60 hover:text-textc ' +
        'shadow-[0_8px_32px_rgba(2,6,23,0.4)] ' +
        'transition-colors duration-150 active:brightness-90'
      }
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};
