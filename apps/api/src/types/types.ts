import { TransformOptions } from 'stream';

import { Request } from 'express';
import { SafeParseSuccess } from 'zod';
import { Stringifier } from 'csv-stringify';

import { VerificationKind } from '#ts/enums';

export interface RequestValidators<T> extends Request {
  validator?: SafeParseSuccess<T>;
}

export type RequestValidator<T> = Required<RequestValidators<T>>;

export type Config = {
  port: number;
  dbUrl: string;
  redisUrl: string;
  mainnetDbUrl: string;
  mainnetRedisUrl: string;
  rpcUrl: string;
  sentryDsn?: string;
  network: string;
  maxQueryRows: number;
  maxQueryCost: number;
  apiFetchKey: string;
  apiOrigin: string;
};

export type StreamTransformWrapper = (
  stringifier: Stringifier,
) => TransformOptions['transform'];

export type User = {
  id: number;
  stripe_cid?: string;
  email: string;
  username: string;
  verified: boolean;
  last_login_at: string;
  plan?: Plan;
  keys?: Key[];
  verification?: Verification;
};

export type Plan = {
  id: number;
  stripe_pid?: string;
  stripe_mpid?: string;
  stripe_ypid?: string;
  title: string;
  limit_per_second: number;
  limit_per_minute: number;
  limit_per_day: number;
  limit_per_month: number;
  price_monthly: number;
  price_annually: number;
};

export type Key = {
  id: number;
  name: string;
  token: number;
  created_at: string;
  updated_at: string;
  user?: User;
};

export type Verification = {
  id: number;
  type: VerificationKind;
  email: string;
  code: string;
  expires_at: string;
  created_at: string;
  user?: User;
};

export type ValidationError = {
  message: string;
  path: string;
};
