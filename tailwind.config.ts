import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0A',
        'bg-light': '#121212',
        'bg-hover': '#1A1A1A',
        'bg-lighter': '#252525',
        card: '#121212',
        primary: '#E94E1B',
        'primary-dark': '#D13D0F',
        textc: '#EEEEEE',
        borderc: '#2A2A2A',
      },
    },
  },
  plugins: [],
};
export default config;
