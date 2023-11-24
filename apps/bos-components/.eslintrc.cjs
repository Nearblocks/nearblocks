module.exports = {
  extends: ['custom-nextjs'],
  root: true,
  rules: {
    'max-len': [
      'warn',
      {
        code: 120,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    '@typescript-eslint/ban-ts-comment': 'off',
    'react/display-name': 'off',
    '@next/next/no-img-element': 'off',
    'import/no-anonymous-default-export': 'off',
  },
};
