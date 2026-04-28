/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#F472B6', // Pink-400
        secondary: '#A78BFA', // Violet-400
        accent: '#FCD34D', // Amber-300
        warm: '#FFF1F2', // Rose-50
        dark: '#4C1D95', // Violet-900
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
        serif: ['"Noto Serif JP"', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'glow': '0 0 20px rgba(244, 114, 182, 0.3)',
      }
    },
  },
  plugins: [],
};
