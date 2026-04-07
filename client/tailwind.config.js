/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        choco: {
          50: '#fdf8f1',
          100: '#f2e4d8',
          200: '#e4c9a7',
          300: '#d4a574',
          400: '#c17f3f',
          500: '#a86219',
          600: '#8b4e12',
          700: '#6f3f0f',
          800: '#5a330f',
          900: '#492a0f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
