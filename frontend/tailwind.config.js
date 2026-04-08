/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4F8EF7',
        secondary: '#6EE7B7',
        accent: '#F59E0B',
        bg: '#F8FAFC',
        text: '#1F2937',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(15, 23, 42, 0.08)',
        'soft-lg': '0 12px 40px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
}

