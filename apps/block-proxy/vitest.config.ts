import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

// The package `imports` map points #* at ./dist for runtime. Tests run against
// source, so resolve the same specifiers to ./src instead of requiring a build.
const src = fileURLToPath(new URL('./src/', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [{ find: /^#(.*)$/, replacement: `${src}$1.ts` }],
  },
});
