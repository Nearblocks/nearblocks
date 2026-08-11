export const Chains = {
  ARBITRUM: 'arbitrum',
  BASE: 'base',
  BSC: 'bsc',
  ETHEREUM: 'ethereum',
  NEAR: 'near',
  POLYGON: 'polygon',
  SOLANA: 'solana',
} as const;

export type Chains = (typeof Chains)[keyof typeof Chains];

export const EvmChains = {
  ARBITRUM: Chains.ARBITRUM,
  BASE: Chains.BASE,
  BSC: Chains.BSC,
  ETHEREUM: Chains.ETHEREUM,
  POLYGON: Chains.POLYGON,
} as const;

export type EvmChains = (typeof EvmChains)[keyof typeof EvmChains];
