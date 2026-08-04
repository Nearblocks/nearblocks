import { MultichainSignature, Network } from 'nb-types';

export interface Config {
  backfillWindowSize: bigint;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbUrlBase: string;
  genesisHeight: number;
  indexerKey: string;
  insertLimit: number;
  neardataConcurrency: 'auto' | number;
  neardataUrl: string;
  network: Network;
  rpcUrl: string;
  sentryDsn?: string;
  signerEndTimestamp: string;
  signerStartTimestamp: string;
  startBlockHeight: number;
}

export type Sign = {
  request: SignRequest;
};

export type SignRequest = {
  domain_id?: number | string;
  key_version?: number;
  path?: string;
};

export type MSMpcKey = {
  account_id: string;
  block_timestamp: string;
  domain_id: number;
  path: string;
};

export type MSReceipt = Omit<
  MultichainSignature,
  'r' | 's' | 'scheme' | 'signature' | 'v'
>;

export type MSSignature = Omit<
  MultichainSignature,
  'event_index' | 'path' | 'public_key' | 'receipt_id'
>;

export type Scheme = 'ed25519' | 'Ed25519' | 'secp256k1' | 'Secp256k1';

export interface Ed25519Signature {
  signature: number[];
}

export interface RSVSignature {
  r: string;
  s: string;
  v: number;
}

export interface NearNearMpcSignature {
  big_r: {
    affine_point: string;
  };
  recovery_id: number;
  s: {
    scalar: string;
  };
}

export interface ChainSigNearMpcSignature {
  big_r: string;
  recovery_id: number;
  s: string;
}

export interface ChainSigEvmMpcSignature {
  bigR: { x: bigint; y: bigint };
  recoveryId: number;
  s: bigint;
}

export type MPCSignature =
  | { scheme: Scheme }
  | ChainSigEvmMpcSignature
  | ChainSigNearMpcSignature
  | Ed25519Signature
  | NearNearMpcSignature;
