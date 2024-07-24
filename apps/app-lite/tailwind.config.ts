/* eslint-disable perfectionist/sort-objects */
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../bos-lite/src/**/*.{ts,tsx}'],
  corePlugins: {
    container: false,
  },
  darkMode: 'class',
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        '.container': {
          maxWidth: '100%',
          '@screen lg': {
            maxWidth: '1024px',
          },
          '@screen xl': {
            maxWidth: '1072px',
          },
        },
      });
    }),
  ],
  theme: {
    colors: {
      inherit: 'inherit',
      current: 'currentColor',
      transparent: 'transparent',
      primary: 'rgb(var(--color-primary))',
      black: '#000',
      white: '#fff',
      red: '#dc2626',
      'bg-body': 'rgb(var(--color-bg-body))',
      'bg-box': 'rgb(var(--color-bg-box))',
      'bg-skeleton': 'rgb(var(--color-bg-skeleton))',
      'bg-tooltip': 'rgb(var(--color-bg-tooltip))',
      'bg-code': 'rgb(var(--color-bg-code))',
      'bg-function': 'rgb(var(--color-bg-function))',
      'bg-transfer': 'rgb(var(--color-bg-transfer))',
      'bg-stake': 'rgb(var(--color-bg-stake))',
      'bg-contract': 'rgb(var(--color-bg-contract))',
      'bg-account-add': 'rgb(var(--color-bg-account-add))',
      'bg-account-delete': 'rgb(var(--color-bg-account-delete))',
      'bg-key-add': 'rgb(var(--color-bg-key-add))',
      'bg-key-delete': 'rgb(var(--color-bg-key-delete))',
      'text-body': 'rgb(var(--color-text-body))',
      'text-box': 'rgb(var(--color-text-box))',
      'text-input': 'rgb(var(--color-text-input))',
      'text-label': 'rgb(var(--color-text-label))',
      'text-tooltip': 'rgb(var(--color-text-tooltip))',
      'text-method': 'rgb(var(--color-text-method))',
      'text-warning': 'rgb(var(--color-text-warning))',
      'border-body': 'rgb(var(--color-border-body))',
    },
    container: {
      screens: {
        DEFAULT: '100%',
        lg: '1024px',
        xl: '1072px',
      },
    },
    extend: {
      backgroundImage: {
        'bg-gradient': "url('/bg-gradient.jpeg')",
      },
    },
    fontFamily: {
      heading: ['var(--font-heading)'],
      mono: ['var(--font-mono)'],
      sans: ['var(--font-sans)'],
      skeleton: ['Arial', 'sans-serif'],
    },
    screens: {
      xs: '460px',
      ...defaultTheme.screens,
    },
  },
};

export default config;
