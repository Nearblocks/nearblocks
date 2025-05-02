export const Chains = {
  ARBITRUM: 'ARBITRUM',
  BASE: 'BASE',
  BITCOIN: 'BITCOIN',
  BSC: 'BSC',
  ETHEREUM: 'ETHEREUM',
  GNOSIS: 'GNOSIS',
  OPTIMISM: 'OPTIMISM',
  POLYGON: 'POLYGON',
  SOLANA: 'SOLANA',
} as const;

export type Chains = (typeof Chains)[keyof typeof Chains];
