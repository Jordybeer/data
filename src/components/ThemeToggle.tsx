'use client';

import { useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { DotLottie } from '@lottiefiles/dotlottie-react';
import { useTheme } from './ThemeProvider';

const LOTTIE_SRC = 'https://lottie.host/4930d9a9-fe50-4128-bbc1-cdda8fcbe08c/9TArMKSg77.lottie';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const lottieRef = useRef<DotLottie | null>(null);
  const prevTheme = useRef(theme);

  useEffect(() => {
    const dl = lottieRef.current;
    if (!dl || prevTheme.current === theme) return;
    prevTheme.current = theme;
    if (theme === 'light') {
      dl.setMode('forward');
      dl.play();
    } else {
      dl.setMode('reverse');
      dl.play();
    }
  }, [theme]);

  if (!LOTTIE_SRC) {
    return <FallbackToggle theme={theme} onClick={toggle} />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Schakel naar lichtmodus' : 'Schakel naar donkermodus'}
      className="relative w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
    >
      <DotLottieReact
        src={LOTTIE_SRC}
        autoplay={false}
        loop={false}
        dotLottieRefCallback={(dl) => { lottieRef.current = dl; }}
        style={{ width: 40, height: 40 }}
      />
    </button>
  );
}

function FallbackToggle({ theme, onClick }: { theme: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={theme === 'dark' ? 'Schakel naar lichtmodus' : 'Schakel naar donkermodus'}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 border border-white/[0.10] bg-white/[0.06] text-textc/70"
    >
      {theme === 'dark' ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}
