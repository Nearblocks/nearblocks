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

const ftBalance = v.object({
  amount: v.string(),
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

const mtFtTokenMeta = v.object({
  contract: v.string(),
  media: v.nullable(v.string()),
  price: v.nullable(v.string()),
  reference: v.nullable(v.string()),
  title: v.nullable(v.string()),
  token: v.string(),
});

const mtFt = v.object({
  amount: v.string(),
  contract: v.string(),
  meta: v.optional(mtBaseMeta),
  token: v.string(),
  token_meta: mtFtTokenMeta,
});

const mtFtCount = v.object({
  count: v.string(),
});

const mtNft = v.object({
  amount: v.string(),
  contract: v.string(),
  meta: v.optional(mtBaseMeta),
  token: v.string(),
  token_meta: mtTokenMeta,
});

const mtNftCount = v.object({
  count: v.string(),
});

const ftsResponse = responseSchema(v.array(ft));
const ftCountResponse = responseSchema(ftCount);
const ftBalanceResponse = responseSchema(ftBalance);
const nftsResponse = responseSchema(v.array(nft));
const nftCountResponse = responseSchema(nftCount);
const mtFtsResponse = responseSchema(v.array(mtFt));
const mtFtCountResponse = responseSchema(mtFtCount);
const mtNftsResponse = responseSchema(v.array(mtNft));
const mtNftCountResponse = responseSchema(mtNftCount);

export type AccountAssetFT = v.InferOutput<typeof ft>;
export type AccountAssetFTCount = v.InferOutput<typeof ftCount>;
export type AccountAssetFTBalance = v.InferOutput<typeof ftBalance>;
export type AccountAssetNFT = v.InferOutput<typeof nft>;
export type AccountAssetNFTCount = v.InferOutput<typeof nftCount>;
export type AccountAssetMTFT = v.InferOutput<typeof mtFt>;
export type AccountAssetMTFTCount = v.InferOutput<typeof mtFtCount>;
export type AccountAssetMTNFT = v.InferOutput<typeof mtNft>;
export type AccountAssetMTNFTCount = v.InferOutput<typeof mtNftCount>;

export type AccountAssetFTsRes = v.InferOutput<typeof ftsResponse>;
export type AccountAssetFTCountRes = v.InferOutput<typeof ftCountResponse>;
export type AccountAssetFTBalanceRes = v.InferOutput<typeof ftBalanceResponse>;
export type AccountAssetNFTsRes = v.InferOutput<typeof nftsResponse>;
export type AccountAssetNFTCountRes = v.InferOutput<typeof nftCountResponse>;
export type AccountAssetMTFTsRes = v.InferOutput<typeof mtFtsResponse>;
export type AccountAssetMTFTCountRes = v.InferOutput<typeof mtFtCountResponse>;
export type AccountAssetMTNFTsRes = v.InferOutput<typeof mtNftsResponse>;
export type AccountAssetMTNFTCountRes = v.InferOutput<
  typeof mtNftCountResponse
>;

export default {
  ftBalance: ftBalanceResponse,
  ftCount: ftCountResponse,
  fts: ftsResponse,
  mtFtCount: mtFtCountResponse,
  mtFts: mtFtsResponse,
  mtNftCount: mtNftCountResponse,
  mtNfts: mtNftsResponse,
  nftCount: nftCountResponse,
  nfts: nftsResponse,
};
