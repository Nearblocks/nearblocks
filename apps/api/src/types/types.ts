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
  apiAccessKey: string;
  apiUrl: string;
  campaignsPublicUrl: string;
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  dbWriteUrl: string;
  mainnetUrl: string;
  maxQueryCost: number;
  maxQueryRows: number;
  network: string;
  otelExporterApiKey?: string;
  otelExporterEndpoint?: string;
  otelServiceName?: string;
  port: number;
  ratelimiterRedisPassword: string;
  ratelimiterRedisSentinelName: string;
  ratelimiterRedisSentinelPassword: string;
  ratelimiterRedisSentinelUrls: string;
  ratelimiterRedisUrl: string;
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

export type Campaign = {
  api_subscription_id: number;
  click_count: number;
  desktop_image_center: string;
  desktop_image_right: string;
  icon: string;
  id: number;
  impression_count: number;
  is_active: boolean;
  is_approved: boolean;
  link_name: string;
  mobile_image: string;
  site_name: string;
  start_date: string;
  text: string;
  title: string;
  url: string;
  user_id: number;
};

export type RPCResponse = {
  block_hash: string;
  block_height: number;
  result: Uint8Array;
};

export type IntentsToken = {
  token_id: string;
};

export type MtMetadata = {
  base: {
    decimals?: number;
    icon?: string;
    id: string;
    name: string;
    symbol: string;
  };
  token: {
    description?: string;
    extra?: string;
    issued_at?: number;
    media?: string;
    starts_at?: number;
    title?: string;
    updated_at?: number;
  };
};
