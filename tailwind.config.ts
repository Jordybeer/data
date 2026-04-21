import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'selector',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        foreground: 'var(--text)',
        accent: 'var(--accent)',
        surface: 'var(--surface)',
      },
      zIndex: {
        'nav':         '100',
        'modal':       '200',
        'modal-toast': '300',
        'popover':     '400',
      },
      keyframes: {
        'fade-in':  { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
        'slide-in-from-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-out-to-right':  { from: { transform: 'translateX(0)' },    to: { transform: 'translateX(100%)' } },
      },
      animation: {
        'in':  'fade-in 0.2s ease',
        'out': 'fade-out 0.2s ease',
      },
    },
  },
  plugins: [],
};
export default config;
