import { FTKeyEncoding, FTValueEncoding, Network } from 'nb-types';

export type Config = {
  bucketHours: number;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrlBase: string;
  dbUrlContract: string;
  dbUrlEvents: string;
  fromScratch: boolean;
  insertLimit: number;
  network: Network;
  rpcDelayMs: number;
  rpcUrl: string;
  sentryDsn?: string;
  verifySamples: number;
};

export type CodeHashFamily = {
  blockHeight: number;
  codeHash: null | string;
  contracts: string[];
};

export type LayoutSample = { account: string; amount: bigint };

export type InferredLayout = {
  accountOffset: null | number;
  accountPath: null | string;
  blockHeight: number;
  keyEncoding: FTKeyEncoding;
  prefix: Buffer;
  samples: LayoutSample[];
  valueEncoding: FTValueEncoding;
  valueOffset: null | number;
  valuePath: null | string;
};

export type Observation = {
  account: string;
  accountEnd: null | number;
  accountOffset: null | number;
  accountPath: null | string;
  json: unknown;
  keyEncoding: FTKeyEncoding;
  prefix: Buffer;
  value: Buffer;
  valueEncoding: FTValueEncoding;
};

export type LayoutResult =
  | {
      candidates: InferredLayout[];
      reason?: undefined;
      unsupported?: undefined;
    }
  | { candidates: null; reason: string; unsupported: boolean };

export type Candidate = { blockTimestamp: string; contract: string };

export type CandidateBatch = { bucketEnd: bigint; contracts: Candidate[] };

export type PendingFamily = Omit<CodeHashFamily, 'blockHeight'> & {
  blockTimestamp: string;
};

export type VerifyResult = 'inconclusive' | 'match' | 'mismatch' | 'rejected';

export type ViewCall = { errorName: string; result: null | number[] };

export type Resolution = {
  layout: InferredLayout | null;
  result: LayoutResult;
  verifyResult: VerifyResult;
};

export type DataChange = { key: Buffer; value: Buffer };

export type RpcErrorBody = {
  error?: { cause?: { name?: string }; data?: string; message?: string };
};

export type JsonLeaf = { path: string; text: string };

export type Bucket = {
  accountPath: null | string;
  keyEncoding: Observation['keyEncoding'];
  observations: Observation[];
  prefix: Buffer;
  valueEncoding: Observation['valueEncoding'];
};
