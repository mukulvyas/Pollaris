/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#F5831F',
          dark: '#d96b0a',
          light: '#FFB74D',
          50: '#FFF3E0',
          100: '#FFE0B2',
        },
        secondary: {
          DEFAULT: '#1B5E20',
          light: '#4CAF50',
          50: '#E8F5E9',
        },
        surface: '#F5F5F0',
        card: '#FFFFFF',
        border: '#E0E0E0',
        inactive: '#999999',
      },
      boxShadow: {
        'phone': '0 0 60px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
