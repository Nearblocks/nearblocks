import { Request } from 'express';
import { SafeParseSuccess } from 'zod';

export interface RequestValidators<T> extends Request {
  validator?: SafeParseSuccess<T>;
}

export type RequestValidator<T> = Required<RequestValidators<T>>;

export type Config = {
  network: string;
  port: number;
};

export type NetworkId = 'mainnet' | 'testnet';

export type Network = {
  networkId: NetworkId;
};
