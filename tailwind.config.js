/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        btc: {
          DEFAULT: '#F7931A',
          hover: '#E07F07',
          dark: '#B06303',
        },
        surface: {
          base: '#0B0F17',
          panel: '#111827',
          card: '#182234',
          border: '#223049',
          borderHover: '#334769',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
