/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  plugins: [],
  theme: {
    extend: {
      backgroundColor: {
        'blue-900-15': 'rgba(76 ,189 ,187  ,0.15)',
      },
      // textColor: ['dark'],
      backgroundImage: (theme) => ({
        'hero-pattern': "url('/images/wavey_fingerprint.png')",
        'hero-pattern-dark': "url('/images/wavey_fingerprint_dark.png')",
      }),
      borderRadius: {
        '4xl': '30px',
      },
      colors: {
        black: {
          200: '#1F2228',
          300: '#121212',
          500: '#171717',
          600: '#0d0d0d',
          DEFAULT: '#1B1B1B',
        },
        blue: '#21325b',
        blue: {
          100: '#b2fff1',
          200: '#a8f9e7',
          300: '#9eefdd',
          400: '#94e5d3',
          500: '#8adbc9',
          600: '#80d1bf',
          700: '#76c7b5',
          800: '#6cbdab',
          900: '#4CBDBB',
          DEFAULT: '#8adbc9',
        },
        brightgreen: {
          DEFAULT: '#36C054',
        },
        button: '#4C9DDF',
        current: 'currentColor',
        green: {
          100: '#357172',

          200: '#2b6768',
          250: '#31766A',
          300: '#215d5e',
          400: '#175354',
          500: '#0d494a',
          600: '#033f40',

          700: '#003536',
          800: '#002b2c',
          900: '#002122',
          DEFAULT: '#0d494a',
        },
        nearblue: {
          600: '#4b5563',
          700: '#9CA3AF',
          DEFAULT: '#F1F9FF',
        },
        neargray: {
          10: '#f3f3f3',
          100: '#C5CDD5',
          25: '#FAFAFA',
          50: '#8E8E8E',
          600: '#676767',
          700: '#E9ECEF',
          800: '#DEE2E6',
          DEFAULT: '#676767',
        },

        neargreen: {
          200: '#338E7B',
          DEFAULT: '#35C154',
        },
        theme: '#000c00',
        transparent: 'transparent',
        'warning-dark': '#BF4F4F',
        'warning-light': '#EBC7C7',
        white: '#fff',
      },
      fontFamily: {
        sans: "'Manrope', sans-serif",
      },
      fontSize: {
        tiny: '.65625rem',
      },
      height: {
        45: '11.93rem',
      },
      spacing: {
        25: '6.5rem',
      },
      tableLayout: ['hover', 'focus'],
      // backgroundColor: ['dark'],
      width: {
        65: '16.5rem',
      },
    },
  },
};
