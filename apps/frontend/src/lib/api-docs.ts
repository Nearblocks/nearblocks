type Network = 'mainnet' | 'testnet';

const API_BASE: Record<Network, string> = {
  mainnet: 'https://api.nearblocks.io',
  testnet: 'https://api-testnet.nearblocks.io',
};

/**
 * Network-aware URL for the (current v3) API documentation.
 * Optionally deep-links to a specific tag section.
 */
export const apiDocsUrl = (network: Network, tag?: string) => {
  const base = `${API_BASE[network]}/api-docs`;
  return tag ? `${base}#tag/${tag}` : base;
};
