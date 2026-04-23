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
        // design-system tokens used throughout components
        bg:       'rgb(var(--tw-color-bg) / <alpha-value>)',
        card:     'rgba(15, 23, 42, 0.78)',
        textc:    'rgb(var(--tw-color-textc) / <alpha-value>)',
        borderc:  'rgba(255, 255, 255, 0.08)',
        primary:  'rgb(129 140 248 / <alpha-value>)',
        'bg-hover': 'rgba(255, 255, 255, 0.08)',
        warning:  '#fbbf24',
        // legacy aliases
        background: 'var(--pd-bg)',
        foreground: 'var(--pd-text)',
        surface:    'rgba(15, 23, 42, 0.92)',
      },
      zIndex: {
        nav:           '100',
        modal:         '200',
        'modal-toast': '300',
        popover:       '400',
      },
      keyframes: {
        'fade-in':             { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-out':            { from: { opacity: '1' }, to: { opacity: '0' } },
        'slide-in-from-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-out-to-right':  { from: { transform: 'translateX(0)' },    to: { transform: 'translateX(100%)' } },
        'slide-up':            { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
      },
      animation: {
        in:         'fade-in 0.2s ease',
        out:        'fade-out 0.2s ease',
        'slide-up': 'slide-up 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
