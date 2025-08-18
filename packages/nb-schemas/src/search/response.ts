import * as v from 'valibot';

import { responseSchema } from '../common.js';

const account = v.object({
  account_id: v.string(),
});

const block = v.object({
  block_hash: v.string(),
  block_height: v.string(),
});

const ft = v.object({
  contract: v.string(),
});

const key = v.object({
  account_id: v.string(),
});

// const mt = v.object({
//   contract: v.string(),
// });

const nft = v.object({
  contract: v.string(),
});

const receipt = v.object({
  receipt_id: v.string(),
  transaction_hash: v.string(),
});

const txn = v.object({
  transaction_hash: v.string(),
});

const search = v.object({
  accounts: v.array(account),
  blocks: v.array(block),
  fts: v.array(ft),
  keys: v.array(key),
  // mts: v.array(mt),
  nfts: v.array(nft),
  receipts: v.array(receipt),
  txns: v.array(txn),
});

const accountResponse = responseSchema(v.array(account));
const blockResponse = responseSchema(v.array(block));
const ftResponse = responseSchema(v.array(ft));
const keyResponse = responseSchema(v.array(key));
// const mtResponse = responseSchema(v.array(mt));
const nftResponse = responseSchema(v.array(nft));
const receiptResponse = responseSchema(v.array(receipt));
const txnResponse = responseSchema(v.array(txn));
const searchResponse = responseSchema(search);

export type SearchAccount = v.InferOutput<typeof account>;
export type SearchBlock = v.InferOutput<typeof block>;
export type SearchFt = v.InferOutput<typeof ft>;
export type SearchKey = v.InferOutput<typeof key>;
// export type SearchMt = v.InferOutput<typeof mt>;
export type SearchNft = v.InferOutput<typeof nft>;
export type SearchReceipt = v.InferOutput<typeof receipt>;
export type SearchTxn = v.InferOutput<typeof txn>;
export type Search = v.InferOutput<typeof search>;

export type SearchAccountRes = v.InferOutput<typeof accountResponse>;
export type SearchBlockRes = v.InferOutput<typeof blockResponse>;
export type SearchFtRes = v.InferOutput<typeof ftResponse>;
export type SearchKeyRes = v.InferOutput<typeof keyResponse>;
// export type SearchMtRes = v.InferOutput<typeof mtResponse>;
export type SearchNftRes = v.InferOutput<typeof nftResponse>;
export type SearchReceiptRes = v.InferOutput<typeof receiptResponse>;
export type SearchTxnRes = v.InferOutput<typeof txnResponse>;
export type SearchRes = v.InferOutput<typeof searchResponse>;

export default {
  accounts: accountResponse,
  blocks: blockResponse,
  fts: ftResponse,
  keys: keyResponse,
  // mts: mtResponse,
  nfts: nftResponse,
  receipts: receiptResponse,
  search: searchResponse,
  txns: txnResponse,
};
