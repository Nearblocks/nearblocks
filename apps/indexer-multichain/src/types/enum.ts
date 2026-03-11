export const Chains = {
  ARBITRUM: 'ARBITRUM',
  AURORA: 'AURORA',
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
