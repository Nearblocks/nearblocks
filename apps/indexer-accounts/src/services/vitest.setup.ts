import Module from 'node:module';

// #libs/utils loads nb-json via createRequire (CJS), which bypasses Vite's
// module resolution/aliasing entirely. The real binary is a gitignored,
// platform-specific native build (compiled fresh per-platform only inside
// the Docker image) that is not guaranteed to match the machine running
// tests, so stub it at the Node module-loader level instead. Only
// jsonStringify (FunctionCall permission JSON) is exercised by this app,
// so JSON.stringify is behaviourally equivalent here.
const nodeModule = Module as unknown as {
  _load: (request: string, ...rest: unknown[]) => unknown;
};
const originalLoad = nodeModule._load.bind(nodeModule);

nodeModule._load = (request: string, ...rest: unknown[]) =>
  request === 'nb-json'
    ? { parse: JSON.parse, stringify: JSON.stringify }
    : originalLoad(request, ...rest);
