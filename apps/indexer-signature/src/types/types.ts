import { MultichainSignature, Network } from 'nb-types';

export interface Config {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbUrlBase: string;
  delta: number;
  indexerKey: string;
  insertLimit: number;
  network: Network;
  s3AccessKey: string;
  s3Bucket: string;
  s3Host: string;
  s3Port: number;
  s3SecretKey: string;
  s3UseSsl: boolean;
  sentryDsn?: string;
  startBlockHeight: number;
}

export type Sign = {
  request: SignRequest;
};

export type SignRequest = {
  path: string;
};

export type MSInitial = Pick<
  MultichainSignature,
  'account_id' | 'block_timestamp' | 'path' | 'transaction_hash'
>;

export type MSFinal = Pick<
  MultichainSignature,
  'r' | 's' | 'scheme' | 'signature' | 'transaction_hash' | 'v'
>;

export type MSReceipt = Omit<
  MSInitial,
  'block_timestamp' | 'transaction_hash'
> & {
  receipt_id: string;
};

export type MSSignature = Omit<MSFinal, 'transaction_hash'> & {
  receipt_id: string;
};

export type Ecdsa = {
  big_r: {
    affine_point: string;
  };
  recovery_id: number;
  s: {
    scalar: string;
  };
  scheme?: string;
};

export type Eddsa = {
  scheme?: string;
  signature: number[];
};
