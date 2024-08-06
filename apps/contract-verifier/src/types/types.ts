import { Request } from 'express';
import { SafeParseSuccess } from 'zod';

export interface RequestValidators<T> extends Request {
  validator?: SafeParseSuccess<T>;
}

export type RequestValidator<T> = Required<RequestValidators<T>>;

export type Config = {
  dbCa: string;
  dbCert: string;
  dbKey: string;
  dbUrl: string;
  network: string;
  redisPassword: string;
  redisSentinelName: string;
  redisSentinelPassword: string;
  redisSentinelUrls: string;
  redisUrl: string;
  rpcUrl: string;
  sentryDsn?: string;
  userDbUrl: string;
};
