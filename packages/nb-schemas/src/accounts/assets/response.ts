import * as v from 'valibot';

import { responseSchema } from '../../common.js';

const ftMeta = v.object({
  contract: v.string(),
  decimals: v.nullable(v.number()),
  icon: v.nullable(v.string()),
  name: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  symbol: v.nullable(v.string()),
});

const fts = v.object({
  amount: v.string(),
  contract: v.string(),
  meta: v.optional(ftMeta),
});

const ftCount = v.object({
  count: v.string(),
});

const nftMeta = v.object({
  base_uri: v.nullable(v.string()),
  contract: v.string(),
  icon: v.nullable(v.string()),
  name: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  symbol: v.nullable(v.string()),
});

const nftTokenMeta = v.object({
  contract: v.string(),
  media: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  title: v.nullable(v.string()),
  token: v.string(),
});

const nfts = v.object({
  contract: v.string(),
  meta: v.optional(nftMeta),
  token: v.string(),
  token_meta: v.optional(nftTokenMeta),
});

const nftCount = v.object({
  count: v.string(),
});

const ftsResponse = responseSchema(v.array(fts));
const ftCountResponse = responseSchema(ftCount);
const nftsResponse = responseSchema(v.array(nfts));
const nftCountResponse = responseSchema(nftCount);

export type AccountAssetFT = v.InferOutput<typeof fts>;
export type AccountAssetFTCount = v.InferOutput<typeof ftCount>;
export type AccountAssetNFT = v.InferOutput<typeof nfts>;
export type AccountAssetNFTCount = v.InferOutput<typeof nftCount>;

export type AccountAssetFTsRes = v.InferOutput<typeof ftsResponse>;
export type AccountAssetFTCountRes = v.InferOutput<typeof ftCountResponse>;
export type AccountAssetNFTsRes = v.InferOutput<typeof nftsResponse>;
export type AccountAssetNFTCountRes = v.InferOutput<typeof nftCountResponse>;

export default {
  ftCount: ftCountResponse,
  fts: ftsResponse,
  nftCount: nftCountResponse,
  nfts: nftsResponse,
};
