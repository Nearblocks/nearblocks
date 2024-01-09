/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      darkMode: 'class',
      fontFamily: {
        sans: "'Manrope', sans-serif",
      },
      fontSize: {
        tiny: '.65625rem',
      },
    },
  },
  plugins: [],
};
