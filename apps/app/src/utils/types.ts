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
