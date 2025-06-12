import { Block } from '#types/blocks';

export type Response<T> = {
  data: null | T;
  errors?: ResponseError[];
  meta?: ResponseMeta;
};

export type ResponseError = {
  message: string;
  path?: null | string;
};

export type ResponseMeta = {
  next_cursor?: string;
  prev_cursor?: string;
};

export type BlockResponse = Response<Block>;
export type BlockListResponse = Response<Block[]>;
