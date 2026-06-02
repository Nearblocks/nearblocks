import * as v from 'valibot';

import { cursorSchema, limitSchemaMax } from '../../common.js';

const fts = v.object({
  account: v.string(),
  limit: limitSchemaMax(250),
  next: cursorSchema,
  prev: cursorSchema,
});

const ftCount = v.object({
  account: v.string(),
});

const ftsCursor = v.object({
  contract: v.string(),
  value: v.string(),
});

const nfts = v.object({
  account: v.string(),
  limit: limitSchemaMax(24),
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

const mtFts = v.object({
  account: v.string(),
  contract: v.optional(v.string()),
  limit: limitSchemaMax(250),
  next: cursorSchema,
  prev: cursorSchema,
  token: v.optional(v.string()),
});

const mtFtCount = v.object({
  account: v.string(),
});

const mtFtsCursor = v.object({
  contract: v.string(),
  token: v.string(),
  value: v.string(),
});

const mtNfts = v.object({
  account: v.string(),
  limit: limitSchemaMax(24),
  next: cursorSchema,
  prev: cursorSchema,
});

const mtNftCount = v.object({
  account: v.string(),
});

const mtNftsCursor = v.object({
  contract: v.string(),
  token: v.string(),
});

export type AccountAssetFTsReq = v.InferOutput<typeof fts>;
export type AccountAssetFTCountReq = v.InferOutput<typeof ftCount>;
export type AccountAssetFTsCursor = v.InferOutput<typeof ftsCursor>;
export type AccountAssetNFTsReq = v.InferOutput<typeof nfts>;
export type AccountAssetNFTCountReq = v.InferOutput<typeof nftCount>;
export type AccountAssetNFTsCursor = v.InferOutput<typeof nftsCursor>;
export type AccountAssetMTFTsReq = v.InferOutput<typeof mtFts>;
export type AccountAssetMTFTCountReq = v.InferOutput<typeof mtFtCount>;
export type AccountAssetMTFTsCursor = v.InferOutput<typeof mtFtsCursor>;
export type AccountAssetMTNFTsReq = v.InferOutput<typeof mtNfts>;
export type AccountAssetMTNFTCountReq = v.InferOutput<typeof mtNftCount>;
export type AccountAssetMTNFTsCursor = v.InferOutput<typeof mtNftsCursor>;

export default {
  ftCount,
  fts,
  ftsCursor,
  mtFtCount,
  mtFts,
  mtFtsCursor,
  mtNftCount,
  mtNfts,
  mtNftsCursor,
  nftCount,
  nfts,
  nftsCursor,
};
