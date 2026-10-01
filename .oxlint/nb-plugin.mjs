const plugin = {
  meta: { name: 'nb' },
  rules: {
    'require-hold-nav': {
      create: (context) => {
        let importsData = false;
        let callsHoldNav = false;
        return {
          ImportDeclaration: (node) => {
            if (/^@\/data/.test(node.source.value)) importsData = true;
          },
          CallExpression: (node) => {
            if (
              node.callee.type === 'Identifier' &&
              node.callee.name === 'holdNav'
            ) {
              callsHoldNav = true;
            }
          },
          'Program:exit': (node) => {
            if (importsData && !callsHoldNav) {
              context.report({
                node,
                message:
                  'This page/layout fetches via @/data but never calls holdNav(). Add `await holdNav()` after kicking off the fetches, or fully await the data and disable this rule.',
              });
            }
          },
        };
      },
    },
  },
};

export default plugin;
