import * as v from 'valibot';

import { responseSchema } from '../../common.js';

const ftMeta = v.object({
  contract: v.string(),
  decimals: v.nullable(v.number()),
  icon: v.nullable(v.string()),
  name: v.nullable(v.string()),
  price: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  symbol: v.nullable(v.string()),
});

const ft = v.object({
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

const nft = v.object({
  contract: v.string(),
  meta: v.optional(nftMeta),
  token: v.string(),
  token_meta: v.optional(nftTokenMeta),
});

const nftCount = v.object({
  count: v.string(),
});

const mtBaseMeta = v.object({
  base_uri: v.nullable(v.string()),
  contract: v.string(),
  decimals: v.nullable(v.number()),
  icon: v.nullable(v.string()),
  name: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  symbol: v.nullable(v.string()),
  token: v.string(),
});

const mtTokenMeta = v.object({
  contract: v.string(),
  media: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  title: v.nullable(v.string()),
  token: v.string(),
});

const mt = v.object({
  amount: v.string(),
  contract: v.string(),
  meta: v.optional(mtBaseMeta),
  token: v.string(),
  token_meta: v.optional(mtTokenMeta),
});

const mtCount = v.object({
  count: v.string(),
});

const ftsResponse = responseSchema(v.array(ft));
const ftCountResponse = responseSchema(ftCount);
const nftsResponse = responseSchema(v.array(nft));
const nftCountResponse = responseSchema(nftCount);
const mtsResponse = responseSchema(v.array(mt));
const mtCountResponse = responseSchema(mtCount);

export type AccountAssetFT = v.InferOutput<typeof ft>;
export type AccountAssetFTCount = v.InferOutput<typeof ftCount>;
export type AccountAssetNFT = v.InferOutput<typeof nft>;
export type AccountAssetNFTCount = v.InferOutput<typeof nftCount>;
export type AccountAssetMT = v.InferOutput<typeof mt>;
export type AccountAssetMTCount = v.InferOutput<typeof mtCount>;

export type AccountAssetFTsRes = v.InferOutput<typeof ftsResponse>;
export type AccountAssetFTCountRes = v.InferOutput<typeof ftCountResponse>;
export type AccountAssetNFTsRes = v.InferOutput<typeof nftsResponse>;
export type AccountAssetNFTCountRes = v.InferOutput<typeof nftCountResponse>;
export type AccountAssetMTsRes = v.InferOutput<typeof mtsResponse>;
export type AccountAssetMTCountRes = v.InferOutput<typeof mtCountResponse>;

export default {
  ftCount: ftCountResponse,
  fts: ftsResponse,
  mtCount: mtCountResponse,
  mts: mtsResponse,
  nftCount: nftCountResponse,
  nfts: nftsResponse,
};
