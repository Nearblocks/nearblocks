import { Request } from 'express';
import { ZodSafeParseSuccess } from 'zod';

export interface RequestValidators<T> extends Request {
  validator?: ZodSafeParseSuccess<T>;
}

export type RequestValidator<T> = Required<RequestValidators<T>>;

export type Config = {
  network: string;
  port: number;
  mainnetUrl: string;
  testnetUrl: string;
};

export type NetworkId = 'mainnet' | 'testnet';

export type Network = {
  networkId: NetworkId;
};
export type ActionType = {
  [key: string]: any;
};
