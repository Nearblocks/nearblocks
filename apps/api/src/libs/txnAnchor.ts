import type { Txn } from 'nb-schemas';

import config from '#config';
import { dbBase, pgp } from '#libs/pgp';
import redis from '#libs/redis';
import { rollingWindow } from '#libs/response';
import sql from '#sql/txns';

export type TxnAnchor = Pick<
  Txn,
  | 'block_timestamp'
  | 'index_in_chunk'
  | 'receipt_conversion_gas_burnt'
  | 'receipt_conversion_tokens_burnt'
  | 'receiver_account_id'
  | 'shard_id'
  | 'signer_account_id'
  | 'transaction_hash'
> & {
  converted_into_receipt_id: string;
  included_in_block_hash: string;
};

// Anchor is immutable once the txn's block is old enough not to be reorged,
// so it can sit in cache for a long time. Still-recent txns get a short TTL
// so a not-yet-indexed miss doesn't stick around.
const FINALIZED_TTL_S = 3600;
const RECENT_TTL_S = 5;
const FINALITY_MARGIN_NS = 60_000_000_000n; // 60s in ns

const inflight = new Map<string, Promise<null | TxnAnchor>>();

const cacheKey = (hash: string) => `v3:txn:anchor:${hash}`;

const queryAnchor = async (hash: string): Promise<null | TxnAnchor> => {
  if (hash.startsWith('0x')) {
    return rollingWindow<TxnAnchor>(
      (start, end) => {
        const cte = pgp.as.format(sql.rlpCte, { end, hash, start });

        return dbBase.oneOrNone<TxnAnchor>(sql.anchor, { cte });
      },
      { label: 'txn.anchor.rlp', start: config.baseStart },
    );
  }

  return rollingWindow<TxnAnchor>(
    (start, end) => {
      const cte = pgp.as.format(sql.txnCte, { end, hash, start });

      return dbBase.oneOrNone<TxnAnchor>(sql.anchor, { cte });
    },
    { label: 'txn.anchor.hash', start: config.baseStart },
  );
};

/**
 * Resolves a txn hash (base58 or `0x` RLP hash) to the small set of columns
 * every downstream txn/receipts/fts/nfts/mts query needs, once, instead of
 * each endpoint independently rolling-window-searching `transactions`.
 *
 * Dedupes concurrent lookups for the same hash within this process (a single
 * txn page fires up to 5 of these in one burst) and caches the result in
 * redis. Not a distributed lock -- a lock would serialize the burst behind
 * whichever request wins it; a shared cache with in-process dedupe lets all
 * of them resolve at the cost of at most one query.
 */
export const resolveTxnAnchor = async (
  hash: string,
): Promise<null | TxnAnchor> => {
  const key = cacheKey(hash);
  const pending = inflight.get(key);

  if (pending) return pending;

  const promise = (async () => {
    try {
      const cached = await redis.parse(key);

      if (cached) return cached as TxnAnchor;
    } catch {
      // cache read unavailable, fall through to the source
    }

    const anchor = await queryAnchor(hash);

    if (anchor) {
      const nowNs = BigInt(Date.now()) * 1_000_000n;
      const finalized =
        nowNs - BigInt(anchor.block_timestamp) > FINALITY_MARGIN_NS;

      try {
        await redis.stringify(
          key,
          anchor,
          finalized ? FINALIZED_TTL_S : RECENT_TTL_S,
        );
      } catch {
        // cache write unavailable (full/down), serve the uncached result
      }
    }

    return anchor;
  })();

  inflight.set(key, promise);

  try {
    return await promise;
  } finally {
    inflight.delete(key);
  }
};
