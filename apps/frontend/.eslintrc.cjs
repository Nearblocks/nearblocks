module.exports = {
  extends: ['custom-next'],
  overrides: [
    {
      files: ['src/app/**/page.tsx', 'src/app/**/layout.tsx'],
      rules: {
        // Pages/layouts that fetch via @/data must hold navigation (promises
        // auto-register in fetcher.ts; forgetting the call brings back the
        // skeleton flash holdNav exists to prevent). Pages that fully await
        // their data instead carry a file-level disable explaining why.
        'no-restricted-syntax': [
          'error',
          {
            message:
              'This page/layout fetches via @/data but never calls holdNav(). ' +
              'Add `await holdNav()` after kicking off the fetches, or fully ' +
              'await the data and disable this rule with a comment.',
            selector:
              'Program:has(ImportDeclaration[source.value=/^@\\u002Fdata/]):not(:has(CallExpression[callee.name="holdNav"]))',
          },
        ],
      },
    },
  ],
  root: true,
};
