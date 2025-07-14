module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:perfectionist/recommended-alphabetical',
    'prettier',
  ],
  overrides: [
    {
      files: ['**/*.js', '**/*.cjs', '**/*.ts'],
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'perfectionist'],
  rules: {
    'perfectionist/sort-imports': [
      'error',
      {
        groups: ['builtin', 'external', 'nb', 'internal'],
        'custom-groups': {
          value: { nb: ['nb-**', 'nb-**/**'] },
        },
        'internal-pattern': ['#**', '#**/**'],
        'newlines-between': 'always',
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true,
      },
    ],
  },
};
