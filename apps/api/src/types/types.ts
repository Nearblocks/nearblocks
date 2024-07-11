import { TransformOptions } from 'stream';

import { Stringifier } from 'csv-stringify';
import { Request } from 'express';
import { SafeParseSuccess } from 'zod';

import { VerificationKind } from '#types/enums';

export interface RequestValidators<T> extends Request {
  validator?: SafeParseSuccess<T>;
}

export type RequestValidator<T> = Required<RequestValidators<T>>;

export type Config = {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  mainnetUrl: string;
  maxQueryCost: number;
  maxQueryRows: number;
  network: string;
  port: number;
  redisPassword: string;
  redisSentinelName: string;
  redisSentinelPassword: string;
  redisSentinelUrls: string;
  redisUrl: string;
  rpcUrl: string;
  sentryDsn?: string;
  testnetUrl: string;
  userDbUrl: string;
};

export type StreamTransformWrapper = (
  stringifier: Stringifier,
) => TransformOptions['transform'];

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
