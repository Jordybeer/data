'use client';

import dynamic from 'next/dynamic';
import { useTheme } from './ThemeProvider';

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((m) => m.DotLottieReact),
  { ssr: false },
);

const LOTTIE_SRC = 'https://lottie.host/4930d9a9-fe50-4128-bbc1-cdda8fcbe08c/9TArMKSg77.lottie';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Schakel naar lichtmodus' : 'Schakel naar donkermodus'}
      className="w-10 h-10 flex items-center justify-center active:scale-90 transition-transform"
    >
      {/* key forces a fresh mount each toggle so autoplay fires from the correct segment */}
      <DotLottieReact
        key={theme}
        src={LOTTIE_SRC}
        autoplay
        loop={false}
        segment={theme === 'light' ? [0, 30] : [31, 60]}
        style={{ width: 40, height: 40 }}
      />
    </button>
  );
}
