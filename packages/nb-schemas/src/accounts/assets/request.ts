import * as v from 'valibot';

import { cursorSchema, limitSchema } from '../../common.js';

const fts = v.object({
  account: v.string(),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const ftCount = v.object({
  account: v.string(),
});

const ftsCursor = v.object({
  amount: v.string(),
  contract: v.string(),
});

const nfts = v.object({
  account: v.string(),
  limit: limitSchema,
  next: cursorSchema,
  prev: cursorSchema,
});

const nftCount = v.object({
  account: v.string(),
});

const nftsCursor = v.object({
  contract: v.string(),
  token: v.string(),
});

export type AccountAssetFTsReq = v.InferOutput<typeof fts>;
export type AccountAssetFTCountReq = v.InferOutput<typeof ftCount>;
export type AccountAssetFTsCursor = v.InferOutput<typeof ftsCursor>;
export type AccountAssetNFTsReq = v.InferOutput<typeof nfts>;
export type AccountAssetNFTCountReq = v.InferOutput<typeof nftCount>;
export type AccountAssetNFTsCursor = v.InferOutput<typeof nftsCursor>;

export default { ftCount, fts, ftsCursor, nftCount, nfts, nftsCursor };
