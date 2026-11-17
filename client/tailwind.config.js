/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Manrope', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { DEFAULT: '#166534', 700: '#15803D', 500: '#22C55E', 100: '#DCFCE7', 50: '#F0FDF4' },
        ink: '#0F172A', muted: '#64748B', surface: '#F8FAFC',
      },
    },
  },
  plugins: [],
};
