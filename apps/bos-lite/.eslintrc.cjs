module.exports = {
  extends: ['custom-next'],
  globals: {
    Link: 'readonly',
    Skeleton: 'readonly',
    Widget: 'readonly',
  },
  root: true,
  rules: {
    '@next/next/no-html-link-for-pages': ['off'],
    'react-hooks/rules-of-hooks': ['off'],
    'react/jsx-no-undef': ['error', { allowGlobals: true }],
  },
};
