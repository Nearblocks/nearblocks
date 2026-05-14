import config from '#config';

// Injects the count cap into the params passed to an estimate.sql call.
// Use everywhere we read a v3 /count endpoint so the cap lives in config only.
export const withCap = <T extends Record<string, unknown>>(
  params: T = {} as T,
) => ({
  ...params,
  cap: config.countCap,
});
