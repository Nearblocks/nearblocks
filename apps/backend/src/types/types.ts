import { Network } from 'nb-types';

export interface Config {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrlBase: string;
  dbUrlEvents: string;
  network: Network;
  rpcUrl: string;
  sentryDsn?: string;
}

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
