import type {
  Account,
  AccountAssetFT,
  AccountAssetNFT,
  AccountBalance,
  AccountFTTxn,
  AccountReceipt,
  AccountTxn,
  BlockListItem,
  Stats,
  TxnDetail,
  TxnFT,
  TxnNFT,
  TxnReceipt,
} from 'nb-schemas';

/**
 * Typed v3 -> v1/v2 row adapters for the limited compatibility layer. Inputs
 * are v3 response types, so a v3 shape change fails typecheck here. v1 sent
 * JSON-aggregated numerics as numbers and top-level numerics as strings.
 */

type Json = unknown;

const num = (value?: null | string) =>
  value === undefined || value === null ? null : Number(value);

// v1's ->> on JSON: strings unquoted, everything else as JSON text.
const text = (value: Json) =>
  value === undefined || value === null
    ? null
    : typeof value === 'string'
      ? value
      : JSON.stringify(value);

const pad = (value: number, size: number) => String(value).padStart(size, '0');

// Synthetic 35-digit id: unique and ordered like v1's, not equal to it.
export const eventIndex = (e: {
  block_timestamp: string;
  event_index: number;
  event_type?: number;
  shard_id: number;
}) =>
  `${e.block_timestamp}${pad(e.shard_id, 3)}${pad(e.event_type ?? 0, 2)}${pad(e.event_index, 11)}`;

const argsJson = (args: Json) =>
  args && typeof args === 'object' && 'args_json' in args
    ? text((args as { args_json: Json }).args_json)
    : null;

const listActions = (actions: { action: string; method: null | string }[]) =>
  actions.map((a) => ({
    action: a.action,
    args: null,
    deposit: null,
    fee: null,
    method: a.method,
  }));

export const account = (
  row: Account,
  balance: AccountBalance | null,
  block: BlockListItem | undefined,
) => ({
  account_id: row.account_id,
  amount: balance?.amount ?? null,
  block_hash: block?.block_hash ?? null,
  block_height: block?.block_height ?? null,
  created: {
    block_timestamp: num(row.created.block_timestamp),
    transaction_hash: row.created.transaction_hash ?? null,
  },
  deleted: {
    block_timestamp: num(row.deleted.block_timestamp),
    transaction_hash: row.deleted.transaction_hash ?? null,
  },
  locked: balance?.amount_staked ?? null,
});

// v1 /account/{a}/receipts (and /txns, which adds receipt_kind).
export const receipt = (r: AccountReceipt) => ({
  actions: listActions(r.actions),
  actions_agg: { deposit: num(r.actions_agg.deposit) },
  block: { block_height: num(r.block.block_height) },
  block_timestamp: r.included_in_block_timestamp,
  id: null,
  included_in_block_hash: null,
  outcomes: { status: null },
  outcomes_agg: { transaction_fee: null },
  predecessor_account_id: r.predecessor_account_id,
  receipt_block: {
    block_hash: r.block.block_hash ?? null,
    block_height: num(r.block.block_height),
    block_timestamp: num(r.block.block_timestamp),
  },
  receipt_conversion_tokens_burnt: null,
  receipt_id: r.receipt_id,
  receipt_outcome: {
    executor_account_id: r.receiver_account_id,
    gas_burnt: null,
    status: r.outcome.status ?? null,
    tokens_burnt: null,
  },
  receiver_account_id: r.receiver_account_id,
  transaction_hash: r.transaction_hash,
});

export const txnOnly = (t: AccountTxn) => ({
  actions: listActions(t.actions),
  actions_agg: { deposit: num(t.actions_agg.deposit) },
  block: { block_height: num(t.block.block_height) },
  block_timestamp: t.block_timestamp,
  id: null,
  included_in_block_hash: t.block.block_hash ?? null,
  outcomes: { status: t.outcomes.status ?? null },
  outcomes_agg: { transaction_fee: num(t.outcomes_agg.transaction_fee) },
  receipt_conversion_tokens_burnt: null,
  receiver_account_id: t.receiver_account_id,
  signer_account_id: t.signer_account_id,
  transaction_hash: t.transaction_hash,
});

export const ftTxn = (e: AccountFTTxn) => ({
  affected_account_id: e.affected_account_id,
  block: { block_height: num(e.block?.block_height) },
  block_timestamp: e.block?.block_timestamp ?? e.block_timestamp,
  cause: e.cause,
  delta_amount: e.delta_amount,
  event_index: eventIndex(e),
  ft: e.meta
    ? {
        contract: e.meta.contract,
        decimals: e.meta.decimals,
        icon: e.meta.icon,
        name: e.meta.name,
        reference: e.meta.reference,
        symbol: e.meta.symbol,
      }
    : null,
  included_in_block_hash: e.block?.block_hash ?? null,
  involved_account_id: e.involved_account_id,
  outcomes: { status: null },
  outcomes_agg: { transaction_fee: null },
  transaction_hash: e.transaction_hash ?? null,
});

export const inventory = (fts: AccountAssetFT[], nfts: AccountAssetNFT[]) => {
  const quantities = nfts.reduce(
    (acc, nft) => acc.set(nft.contract, (acc.get(nft.contract) ?? 0) + 1),
    new Map<string, number>(),
  );
  const nftMeta = new Map(nfts.map((nft) => [nft.contract, nft.meta]));

  return {
    fts: fts.map((ft) => ({
      amount: ft.amount,
      // v1 renamed the ETH bridge proxy contract.
      contract: ft.contract === 'aurora' ? 'eth.bridge.near' : ft.contract,
      ft_meta: {
        decimals: ft.meta?.decimals ?? null,
        icon: ft.meta?.icon ?? null,
        name: ft.meta?.name ?? null,
        price: ft.meta?.price ?? null,
        reference: ft.meta?.reference ?? null,
        symbol: ft.meta?.symbol ?? null,
      },
    })),
    nfts: [...quantities]
      .sort((a, b) => b[1] - a[1])
      .map(([contract, quantity]) => {
        const meta = nftMeta.get(contract);
        return {
          contract,
          nft_meta: {
            icon: meta?.icon ?? null,
            name: meta?.name ?? null,
            reference: meta?.reference ?? null,
            symbol: meta?.symbol ?? null,
          },
          quantity: String(quantity),
        };
      }),
  };
};

// Depth-first, then by block time (v1 ordered receipts by inclusion time).
const flatten = (root: null | TxnReceipt): TxnReceipt[] => {
  const walk = (r: TxnReceipt): TxnReceipt[] => [
    r,
    ...r.receipts.flatMap(walk),
  ];
  const all = root ? walk(root) : [];
  return all
    .map((r, i) => ({ i, r, ts: BigInt(r.block.block_timestamp ?? 0) }))
    .sort((a, b) => (a.ts === b.ts ? a.i - b.i : a.ts < b.ts ? -1 : 1))
    .map(({ r }) => r);
};

// asText: v2 cast event numerics to TEXT, v1 left them as JSON numbers.
const ftEvent = (e: TxnFT, asText: boolean) => ({
  affected_account_id: e.affected_account_id,
  block_timestamp: asText ? e.block_timestamp : Number(e.block_timestamp),
  cause: e.cause,
  delta_amount: asText ? e.delta_amount : Number(e.delta_amount),
  event_index: eventIndex(e),
  ft_meta: {
    contract: e.meta.contract,
    decimals: e.meta.decimals,
    icon: e.meta.icon,
    name: e.meta.name,
    symbol: e.meta.symbol,
  },
  involved_account_id: e.involved_account_id,
});

const nftEvent = (e: TxnNFT, asText: boolean) => ({
  affected_account_id: e.affected_account_id,
  block_timestamp: asText ? e.block_timestamp : Number(e.block_timestamp),
  cause: e.cause,
  delta_amount: e.delta_amount,
  event_index: eventIndex(e),
  involved_account_id: e.involved_account_id,
  nft_meta: {
    base_uri: e.meta.base_uri,
    contract: e.meta.contract,
    icon: e.meta.icon,
    name: e.meta.name,
    reference: e.meta.reference,
    symbol: e.meta.symbol,
  },
  nft_token_meta: e.token_meta
    ? {
        media: e.token_meta.media,
        reference: e.token_meta.reference,
        title: e.token_meta.title,
        token: e.token_meta.token,
      }
    : null,
  token_id: e.token_id,
});

const events = (d: TxnDetail, receiptId: string, asText: boolean) => ({
  fts: d.fts
    .filter((e) => e.receipt_id === receiptId)
    .map((e) => ftEvent(e, asText)),
  nfts: d.nfts
    .filter((e) => e.receipt_id === receiptId)
    .map((e) => nftEvent(e, asText)),
});

export const txnV1 = (d: TxnDetail) => {
  const t = d.txn;
  return {
    actions: t.actions.map((a) => ({
      action: a.action,
      args: argsJson(a.args),
      method: a.method,
    })),
    actions_agg: {
      deposit: num(t.actions_agg.deposit),
      gas_attached: num(t.actions_agg.gas_attached),
    },
    block: { block_height: num(t.block.block_height) },
    block_timestamp: t.block_timestamp,
    included_in_block_hash: t.block.block_hash ?? null,
    outcomes: { status: t.outcomes.status ?? null },
    outcomes_agg: {
      gas_used: num(t.outcomes_agg.gas_used),
      transaction_fee: num(t.outcomes_agg.transaction_fee),
    },
    receipt_conversion_gas_burnt: t.receipt_conversion_gas_burnt,
    receipt_conversion_tokens_burnt: t.receipt_conversion_tokens_burnt,
    receipts: flatten(d.receipts).map((r) => events(d, r.receipt_id, false)),
    receiver_account_id: t.receiver_account_id,
    shard_id: String(t.shard_id),
    signer_account_id: t.signer_account_id,
    transaction_hash: t.transaction_hash,
  };
};

const v2Block = (b: TxnReceipt['block']) => ({
  block_hash: b.block_hash ?? null,
  block_height: num(b.block_height),
  block_timestamp: b.block_timestamp ?? null,
});

export const txnV2 = (d: TxnDetail) => {
  const t = d.txn;
  const root = d.receipts?.outcome;
  return {
    actions: t.actions.map((a) => ({
      action: a.action,
      args: text(a.args),
      method: a.method,
    })),
    actions_agg: t.actions_agg,
    block: v2Block(t.block),
    outcomes: {
      logs: text(root?.logs),
      result: text(root?.result),
      status: t.outcomes.status ?? null,
      status_key: t.outcomes.status_key ?? null,
    },
    outcomes_agg: t.outcomes_agg,
    receipt_conversion_gas_burnt: t.receipt_conversion_gas_burnt,
    receipt_conversion_tokens_burnt: t.receipt_conversion_tokens_burnt,
    receipts: flatten(d.receipts).map((r) => ({
      block: v2Block(r.block),
      outcome: {
        executor_account_id: r.outcome.executor_account_id ?? null,
        gas_burnt: r.outcome.gas_burnt ?? null,
        logs: r.outcome.logs ?? null,
        result: r.outcome.result ?? null,
        status: r.outcome.status ?? null,
        status_key: r.outcome.status_key ?? null,
        tokens_burnt: r.outcome.tokens_burnt ?? null,
      },
      predecessor_account_id: r.predecessor_account_id,
      receipt_id: r.receipt_id,
      receipt_kind: 'ACTION',
      receiver_account_id: r.receiver_account_id,
      ...events(d, r.receipt_id, true),
    })),
    receiver_account_id: t.receiver_account_id,
    shard_id: String(t.shard_id),
    signer_account_id: t.signer_account_id,
    transaction_hash: t.transaction_hash,
  };
};

export const block = (b: BlockListItem) => ({
  author_account_id: b.author_account_id,
  block_hash: b.block_hash,
  block_height: b.block_height,
  block_timestamp: b.block_timestamp,
  chunks_agg: { gas_used: Number(b.chunks_agg.gas_used) },
  transactions_agg: { count: b.transactions_agg.count },
});

export const stats = (s: Stats) => ({
  avg_block_time: s.avg_block_time,
  change_24: s.change_24h,
  circulating_supply: s.circulating_supply,
  gas_price: s.gas_price,
  high_24h: null,
  high_all: null,
  id: null,
  low_24h: null,
  low_all: null,
  market_cap: s.market_cap,
  near_btc_price: s.near_btc_price,
  near_price: s.near_price,
  nodes_online: s.nodes_online,
  total_supply: s.total_supply,
  total_txns: s.total_txns,
  volume: s.volume_24h,
});
