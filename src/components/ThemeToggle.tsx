'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import type { DotLottie } from '@lottiefiles/dotlottie-react';
import { useTheme } from './ThemeProvider';

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((m) => m.DotLottieReact),
  { ssr: false },
);

const LOTTIE_SRC = '/animations/theme-toggle.json';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const lottieRef = useRef<DotLottie | null>(null);
  const mounted = useRef(false);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const handleLottieRef = (dl: DotLottie | null) => {
    if (!dl) return;
    lottieRef.current = dl;
    // Seek to correct frame as soon as the instance is available
    dl.setFrame(themeRef.current === 'light' ? 1 : 0);
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return; // initial frame already handled by handleLottieRef
    }
    const dl = lottieRef.current;
    if (!dl) return;
    if (theme === 'light') {
      dl.setMode('forward');
    } else {
      dl.setMode('reverse');
    }
    dl.play();
  }, [theme]);

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Schakel naar lichtmodus' : 'Schakel naar donkermodus'}
      className="flex items-center justify-center active:scale-90 transition-transform"
    >
      <DotLottieReact
        src={LOTTIE_SRC}
        autoplay={false}
        loop={false}
        dotLottieRefCallback={handleLottieRef}
        style={{ width: 56, height: 56 }}
      />
    </button>
  );
}
