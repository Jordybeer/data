/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0f0f0f',
          light: '#1a1a1a',
          lighter: '#252525',
          hover: '#2d2d2d'
        },
        textc: {
          DEFAULT: '#e5e5e5',
          dim: '#a3a3a3',
          dimmer: '#808080'
        },
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
          light: '#818cf8'
        },
        borderc: '#333',
      },
      boxShadow: {
        'lg2': '0 10px 15px rgba(0, 0, 0, 0.5)'
      }
    },
  },
  plugins: [],
}