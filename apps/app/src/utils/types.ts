import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

export type NextPageWithLayout<T = any> = NextPage<T> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type NetworkId = ProductionNetwork['networkId'];
export type Network = ProductionNetwork;

type ProductionNetwork = {
  networkId: 'testnet' | 'mainnet';
};

export type Stats = {
  block: string;
  gas_price: string;
  avg_block_time: string;
  nodes: string;
  nodes_online: string;
  near_price: string;
  near_btc_price: string;
  market_cap: string;
  volume: string;
  high_24h: string;
  high_all: string;
  low_24h: string;
  low_all: string;
  change_24: number;
  total_supply: string;
  total_txns: string;
};

export type BlocksInfo = {
  author_account_id: string;
  block_hash: string;
  block_height: number;
  block_timestamp: string;
  chunks_agg: {
    gas_limit: number;
    gas_used: number;
  };
  gas_price: number;
  prev_block_hash: string;
  receipts_agg: {
    count: number;
  };
  transactions_agg: {
    count: number;
  };
};

export type Token = {
  name: string;
  contract: string;
  icon: string;
  symbol: string;
  price: string;
  change_24: string;
  volume_24h: string;
  market_cap: string;
  onchain_market_cap: string;
  fully_diluted_market_cap: string;
  total_supply: string;
  circulating_supply: string;
  description: string;
  coingecko_id: string;
  coinmarketcap_id: string;
  holders: string;
  base_uri: string;
  reference: string;
  tokens: string;
  transfers: string;
  transfers_3days: string;
  transfers_day: string;
  website: string;
  meta: {
    twitter: string;
    facebook: string;
    telegram: string;
    coingecko_id: string;
  };
  token: string;
  media: string;
  asset: {
    owner: string;
  };
  decimals: string;
  title: string;
  nft: Token;
};

export type SearchResult = {
  accounts?: Array<{ account_id: string }>;
  txns?: Array<{ transaction_hash: string }>;
  receipts?: Array<{
    receipt_id: string;
    originated_from_transaction_hash: string;
  }>;
  blocks?: Array<{ block_hash: string; block_height: string }>;
};

export type SearchRoute = {
  type?: string;
  path?: string;
};
