/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        yazoo: {
          gold: '#DCA54C',
          dark: '#1A120E',
          brown: '#6B4423',
        },
        caribe: {
          dark: '#1A1410',
          card: '#241C16',
          cream: '#FCFCF9',
        },
      },
      fontFamily: {
        brand: ['Cinzel', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
