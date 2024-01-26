/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{tsx,jsx,ts}'],
  theme: {
    extend: {
      darkMode: 'class',
      fontFamily: {
        sans: "'Roboto'",
      },
      fontSize: {
        tiny: '.65625rem',
      },
      spacing: {
        25: '6.5rem',
      },
      height: {
        45: '11.93rem',
      },
      width: {
        65: '16.5rem',
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        black: '#1B1B1B',
        white: '#fff',
        blue: '#21325b',
        theme: '#000c00',
        button: '#4C9DDF',
        'warning-light': '#EBC7C7',
        'warning-dark': '#BF4F4F',

        neargreen: {
          DEFAULT: '#35C154',
          200: '#338E7B',
        },
        nearblue: {
          DEFAULT: '#F1F9FF',
          600: '#4b5563',
          700: '#9CA3AF',
        },
        neargray: {
          DEFAULT: '#676767',
          25: '#FAFAFA',
          50: '#8E8E8E',
          600: '#676767',
          700: '#E9ECEF',
          800: '#DEE2E6',
        },
        blue: {
          DEFAULT: '#8adbc9',
          100: '#b2fff1',
          200: '#a8f9e7',
          300: '#9eefdd',
          400: '#94e5d3',
          500: '#8adbc9',
          600: '#80d1bf',
          700: '#76c7b5',
          800: '#6cbdab',
          900: '#4CBDBB',
        },
        green: {
          DEFAULT: '#0d494a',
          100: '#357172',
          200: '#2b6768',
          300: '#215d5e',
          400: '#175354',
          500: '#0d494a',
          600: '#033f40',
          700: '#003536',
          800: '#002b2c',
          900: '#002122',
        },
        brightgreen: {
          DEFAULT: '#36C054',
        },
      },
      tableLayout: ['hover', 'focus'],
      borderRadius: {
        '4xl': '30px',
      },
      backgroundColor: {
        'blue-900-15': 'rgba(76 ,189 ,187  ,0.15)',
      },
      backgroundImage: (theme) => ({
        'hero-pattern': "url('/images/wavey_fingerprint.png')",
      }),
    },
  },
  plugins: [],
};
