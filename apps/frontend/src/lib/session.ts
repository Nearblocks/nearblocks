import type { Config } from '@/lib/config';

/**
 * A provider URL points at the apps/api keyless RPC proxy when it is rooted at
 * the configured proxy origin or carries the proxy's `/v1/rpc` path. Public,
 * user-selectable providers (NEAR.org, Lava, dRPC, FastNear Free) never match.
 */
export const isProxyProvider = (url: string, proxyBase: string): boolean => {
  if (!url) return false;

  return (!!proxyBase && url.startsWith(proxyBase)) || url.includes('/v1/rpc');
};

/**
 * A session credential is only required when the Phase-2 flag is on AND the
 * resolved provider is the proxy. User-selected public providers and a flag-off
 * deployment never gate.
 */
export const sessionRequired = (
  providerUrl: string,
  config: Config,
): boolean => {
  return (
    config.rpcSessionEnforced &&
    isProxyProvider(providerUrl, config.rpcProxyUrl)
  );
};
