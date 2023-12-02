export type SatsInfo = {
  near_price: number;
};

export type AccountTimestampInfo = {
  block_timestamp: number;
  transaction_hash: string;
};

export type AccountInfo = {
  account_id: string;
  amount: number;
  code_hash: string;
  created: AccountTimestampInfo;
  deleted: AccountTimestampInfo;
  locked: string;
  storage_usage: number;
};

export type DeploymentsInfo = {
  block_timestamp: number;
  receipt_predecessor_account_id: string;
  transaction_hash: string;
};

export type TokenInfo = {
  name: string;
  icon: string;
  symbol: string;
  price: number;
  website: string;
};

export type MetaInfo = {
  decimals: number;
  icon: string;
  name: string;
  price: number;
  reference: string;
  symbol: string;
};

export type FtsInfo = {
  amount: number;
  contract: string;
  ft_meta: MetaInfo;
};

export type NftsInfo = {
  amount: number;
  contract: string;
  nft_meta: MetaInfo;
  quantity: number;
};

export type InventoryInfo = {
  fts: FtsInfo[];
  nfts: NftsInfo[];
};

export type ContractCodeInfo = {
  block_hash: string;
  block_height: number;
  code_base64: string;
  hash: string;
};

export type KeysInfo = {
  access_key: {
    nonce: number;
    permission: string;
  };
  public_key: string;
};

export type AccessKeyInfo = {
  block_hash: string;
  block_height: number;
  keys: KeysInfo[];
  hash: string;
};

export type ContractInfo = {
  locked?: boolean;
  hash: string;
};

export type TokenListInfo = {
  amount: number;
  contract: string;
  ft_meta: MetaInfo;
  rpcAmount: number;
  amountUsd: number;
};

export type FtInfo = {
  amount: number;
  tokens: TokenListInfo[];
};

export type BlocksInfo = {
  author_account_id: string;
  block_hash: string;
  block_height: number;
  block_timestamp: number;
  chunks_agg: {
    gas_limit: number;
    gas_used: number;
  };
  gas_price: number;
  receipts_agg: {
    count: number;
  };
  transactions_agg: {
    count: number;
  };
};

export type StatusInfo = {
  avg_block_time: number;
  block: number;
  change_24: number;
  gas_price: number;
  high_24h: number;
  high_all: number;
  low_24h: number;
  low_all: number;
  market_cap: number;
  near_btc_price: number;
  near_price: number;
  nodes: number;
  nodes_online: number;
  total_supply: number;
  total_txns: number;
  volume: number;
};
export type ChartSeriesInfo = {
  type: string;
  data: number[];
  color: string;
};

export type ChartConfigType = {
  chart: {
    height: number;
    spacingTop: number;
    spacingBottom: number;
    spacingLeft: number;
    spacingRight: number;
  };
  title: {
    text: null;
  };
  xAxis: {
    type: string;
    lineWidth: number;
    tickLength: number;
    labels: {
      step: number;
    };
    categories: string;
  };
  yAxis: {
    gridLineWidth: number;
    title: {
      text: null;
    };
  };
  legend: {
    enabled: boolean;
  };
  plotOptions: {
    spline: {
      lineWidth: number;
      states: {
        hover: {
          lineWidth: number;
        };
      };
      marker: {
        radius: number;
      };
    };
  };
  series: [ChartSeriesInfo];
  exporting: {
    enabled: boolean;
  };
  credits: {
    enabled: boolean;
  };
};

export type ChartInfo = {
  date: string;
  near_price: string;
  txns: string;
};
