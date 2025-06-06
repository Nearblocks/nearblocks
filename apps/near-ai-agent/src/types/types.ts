import { Request } from 'express';
import { SafeParseSuccess } from 'zod';
import { VerificationKind } from './enum';

export interface RequestValidators<T> extends Request {
  validator?: SafeParseSuccess<T>;
}

export type RequestValidator<T> = Required<RequestValidators<T>>;

export type Key = {
  created_at: string;
  id: number;
  name: string;
  token: number;
  updated_at: string;
  user?: User;
};
export type Verification = {
  code: string;
  created_at: string;
  email: string;
  expires_at: string;
  id: number;
  type: VerificationKind;
  user?: User;
};

export type Config = {
  apiAccessKey: string;
  apiUrl: string;
  network: string;
  port: number;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  userDbUrl: string;

  maxQueryCost: number;
  maxQueryRows: number;
};

export type User = {
  email: string;
  id: number;
  key_id?: number;
  keys?: Key[];
  last_login_at: string;
  plan?: Plan;
  stripe_cid?: string;
  username: string;
  verification?: Verification;
  verified: boolean;
};

export type Plan = {
  id: number;
  limit_per_day: number;
  limit_per_minute: number;
  limit_per_month: number;
  limit_per_second: number;
  price_annually: number;
  price_monthly: number;
  stripe_mpid?: string;
  stripe_pid?: string;
  stripe_ypid?: string;
  title: string;
};

export type ValidationError = {
  message: string;
  path: string;
};

export type RawQueryParams = {
  action?: string;
  method?: string;
  methods?: string[];
  select: string;
};

type ProductionNetwork = {
  networkId: 'mainnet' | 'testnet';
};

export type NetworkId = ProductionNetwork['networkId'];
export type Network = ProductionNetwork;
