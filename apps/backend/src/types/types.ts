import { Account, Block, FTMeta, Network } from 'nb-types';

export interface Config {
  cgApiKey: string;
  cmcApiKey: string;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrlBase: string;
  dbUrlContracts: string;
  dbUrlEvents: string;
  genesisDate: string;
  genesisHeight: number;
  network: Network;
  rpcUrl: string;
  sentryDsn?: string;
}

export type Raw<T> = {
  rows: T[];
};

export type FTMetadata = {
  decimals: number;
  icon: null | string;
  name: string;
  reference: null | string;
  reference_hash: null | string;
  spec: string;
  symbol: string;
};

export type MTContractMetadata = {
  name: string;
  spec: string;
};

export type MTTokenMetadataInfo = {
  base: MTBaseTokenMetadata;
  token: MTTokenMetadata;
};

export type MTBaseTokenMetadata = {
  base_uri: null | string;
  copies: null | number;
  decimals: null | string;
  icon: null | string;
  id: string;
  name: string;
  reference: null | string;
  reference_hash: null | string;
  symbol: null | string;
};

export type MTTokenMetadata = {
  description: null | string;
  expires_at: null | string;
  extra: null | string;
  issued_at: null | string;
  media: null | string;
  media_hash: null | string;
  reference: null | string;
  reference_hash: null | string;
  starts_at: null | string;
  title: null | string;
  updated_at: null | string;
};

export type NFTMetadata = {
  base_uri: null | string;
  icon: null | string;
  name: string;
  reference: null | string;
  reference_hash: null | string;
  spec: string;
  symbol: string;
};

export type NFTTokenInfo = {
  metadata: NFTTokenMetadata;
  owner_id: string;
  token_id: string;
};

export type NFTTokenMetadata = {
  copies: null | number;
  description: null | string;
  expires_at: null | number;
  extra: null | string;
  issued_at: null | number;
  media: null | string;
  media_hash: null | string;
  reference: null | string;
  reference_hash: null | string;
  starts_at: null | number;
  title: null | string;
  updated_at: null | number;
};

export type MetaContract = {
  contract: string;
};

export type MetaContractToken = {
  contract: string;
  token: string;
};

export type FTContractDecimals = Pick<FTMeta, 'contract' | 'decimals'>;

export type FTMarketData = {
  change_24h: null | string;
  circulating_supply: null | string;
  description: null | string;
  facebook: null | string;
  fully_diluted_market_cap: null | string;
  market_cap: null | string;
  reddit: null | string;
  telegram: null | string;
  twitter: null | string;
  volume_24h: null | string;
  website: null | string;
};

export type CGMarketData = FTMarketData & {
  coingecko_id: string;
};

export type CGPriceData = {
  change_24h: null | string;
  market_cap: null | string;
  price: null | string;
  price_btc: null | string;
  volume_24h: null | string;
};

export type CMCMarketData = FTMarketData & {
  coinmarketcap_id: string;
};

export type CGInfo = {
  description: {
    en: string;
  };
  id: string;
  links: {
    facebook_username: string;
    homepage: string[];
    subreddit_url: string;
    telegram_channel_identifier: string;
    twitter_screen_name: string;
  };
  market_data: {
    circulating_supply: string;
    current_price: {
      btc: string;
      usd: string;
    };
    fully_diluted_valuation: {
      usd: string;
    };
    market_cap: {
      usd: string;
    };
    price_change_percentage_24h: string;
    total_volume: {
      usd: string;
    };
  };
};

export type CMCQuoteUSD = {
  USD: {
    fully_diluted_market_cap: string;
    market_cap: string;
    percent_change_24h: string;
    price: string;
    volume_24h: string;
  };
};

export type CMCQuote = {
  data: {
    [id: string]: {
      circulating_supply: string;
      quote: CMCQuoteUSD;
    };
  };
};

export type CMCInfo = {
  data: {
    [id: string]: {
      description: string;
      urls: {
        reddit: string[];
        twitter: string[];
        website: string[];
      };
    };
  };
};

export type RefPrice = {
  price: string;
};

export type RefData = Record<string, RefPrice>;

export type AccountId = Pick<Account, 'account_id'>;

export type BlockSupply = Pick<
  Block,
  'block_height' | 'block_timestamp' | 'total_supply'
>;
