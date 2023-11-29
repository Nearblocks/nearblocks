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

export type AccessKeyInfo = {
  block_hash: string;
  block_height: number;
  keys: {
    access_key: {
      nonce: number;
      permission: string;
    };
    public_key: string;
  }[];
  hash: string;
};

export type ContractInfo = {
  locked?: boolean;
  hash: string;
};

export type FtInfo = {
  amount: number;
  tokens: {
    amount: number;
    contract: string;
    ft_meta: MetaInfo;
    rpcAmount: number;
    amountUsd: number;
  }[];
};
