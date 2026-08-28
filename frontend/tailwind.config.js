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
        yazoo: {
          gold: '#ECA100',
          sun: '#F5B014',
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#ECA100',
          600: '#ca8a04',
          700: '#a16207',
        },
        barrel: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          400: '#b84920',
          500: '#a03e1b',
          600: '#8c2e0b',
          700: '#742306',
          800: '#5c1a03',
          900: '#3d1001',
        },
        caribe: {
          dark: '#120b07',
          card: '#1b120c',
          hover: '#271b12',
          border: '#3b261a',
          accent: '#ECA100',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        brand: ['Cinzel', 'serif'],
      }
    },
  },
  plugins: [],
}