module.exports = {
  extends: [
    'next',
    'turbo',
    'prettier',
    'plugin:perfectionist/recommended-alphabetical',
  ],
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
  },
  plugins: ['@typescript-eslint', 'perfectionist'],
  rules: {
    'perfectionist/sort-imports': [
      'error',
      {
        groups: ['builtin', 'external', 'nb', 'internal'],
        'custom-groups': {
          value: { nb: ['nb-**'] },
          type: { nb: 'nb' },
        },
        'internal-pattern': ['@/**'],
        'newlines-between': 'always',
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
