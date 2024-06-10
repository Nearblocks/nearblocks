export type IconProps = {
  className?: string;
};

export type StatsResponse = {
  stats: Stats[];
};

export type Stats = {
  avg_block_time: string;
  change_24: string;
  circulating_supply: string;
  gas_price: string;
  high_24h: string;
  high_all: string;
  id: number;
  low_24h: string;
  low_all: string;
  market_cap: string;
  near_btc_price: string;
  near_price: string;
  nodes_online: number;
  total_supply: string;
  total_txns: string;
  tps: number;
  volume: string;
};

export type ChartsResponse = {
  charts: Charts[];
};

export type Charts = {
  date: string;
  near_price: string;
  txns: string;
};

export type ChartSeries = {
  date: string;
  price: string;
  txns: string;
  y: number;
};

export type Keys = {
  access: string;
  allowance: string;
  contract: string;
  methods: string;
  publicKey: string;
};

export type PriceResponse = {
  stats: Price[];
};

export type Price = {
  near_price: string;
};
