export interface Outcome {
  execution_outcome: { outcome: { receipt_ids: string[] } };
}

export interface ReceiptOutcome extends Outcome {
  receipt: { receipt_id: string };
  tx_hash?: null | string;
}

export interface IndexerBlock {
  block: {
    chunks: { height_included: number; shard_id: number }[];
    header: {
      hash: string;
      height: number;
      prev_hash: string;
      timestamp_nanosec: string;
    };
  };
  shards: {
    chunk: {
      transactions: {
        outcome: Outcome;
        transaction: { hash: string };
      }[];
    } | null;
    receipt_execution_outcomes: ReceiptOutcome[];
    shard_id: number;
  }[];
  tracked_shards?: number[];
}

export interface ReceiptDelta {
  additions: Map<string, string>;
  executed: string[];
  missing: string[];
}

/** Build speculative changes without mutating the committed pending map. */
export function enrichBlock(
  block: IndexerBlock,
  pending: ReadonlyMap<string, string>,
  trustExistingHashes = false,
): ReceiptDelta {
  const additions = new Map<string, string>();
  const assign = (id: string, hash: string): void => {
    const existing = additions.get(id) ?? pending.get(id);
    if (existing && existing !== hash) {
      throw new Error(`conflicting transaction origin for receipt ${id}`);
    }
    additions.set(id, hash);
  };
  for (const shard of block.shards) {
    for (const tx of shard.chunk?.transactions ?? []) {
      for (const id of tx.outcome.execution_outcome.outcome.receipt_ids) {
        assign(id, tx.transaction.hash);
      }
    }
  }
  const receipts = block.shards.flatMap((s) => s.receipt_execution_outcomes);
  if (trustExistingHashes) {
    for (const receipt of receipts) {
      if (receipt.tx_hash) assign(receipt.receipt.receipt_id, receipt.tx_hash);
    }
  }
  // Same walk as FastNEAR's redis-node `process_block`, which produces
  // neardata: shards and outcomes in order, a receipt resolves only from an
  // origin already known, and its children inherit that origin. Children
  // execute in a later block, so order never hides a parent on mainnet.
  const seen = new Set<string>();
  const missing: string[] = [];
  for (const receipt of receipts) {
    const id = receipt.receipt.receipt_id;
    if (seen.has(id)) throw new Error('duplicate receipt outcome');
    seen.add(id);
    const hash = additions.get(id) ?? pending.get(id);
    receipt.tx_hash = hash ?? null;
    if (!hash) {
      missing.push(id);
      continue;
    }
    for (const child of receipt.execution_outcome.outcome.receipt_ids)
      assign(child, hash);
  }
  return {
    additions,
    executed: receipts.map((r) => r.receipt.receipt_id),
    missing,
  };
}

/** Thrown when the pending map is full; the follower re-anchors to recover. */
export class ReceiptMapFullError extends Error {}

/**
 * Keep executed entries briefly. Pending entries that never execute (data
 * receipts get no execution outcome of their own) expire after
 * `maxAgeBlocks`, so they cannot grow the map without bound. A restart only
 * replays a few hundred blocks, so older ancestry was never durable anyway.
 */
export class ReceiptMap {
  readonly pending = new Map<string, string>();
  private added = new Map<number, string[]>();
  private addedAt = new Map<string, number>();
  private cleanup = new Map<number, string[]>();

  constructor(
    private readonly maxEntries: number,
    private readonly cleanupBlocks = 10,
    private readonly maxAgeBlocks = 10_000,
  ) {}

  check(delta: ReceiptDelta): void {
    let count = this.pending.size;
    for (const id of delta.additions.keys()) if (!this.pending.has(id)) count++;
    if (count > this.maxEntries)
      throw new ReceiptMapFullError('receipt map capacity exceeded');
  }

  clear(): void {
    this.pending.clear();
    this.added.clear();
    this.addedAt.clear();
    this.cleanup.clear();
  }

  commit(height: number, delta: ReceiptDelta): void {
    this.check(delta);
    for (const [id, hash] of delta.additions) {
      this.pending.set(id, hash);
      this.addedAt.set(id, height);
    }
    this.added.set(height, [...delta.additions.keys()]);
    this.cleanup.set(height, delta.executed);
    for (const [executedHeight, ids] of this.cleanup) {
      if (executedHeight > height - this.cleanupBlocks) continue;
      for (const id of ids) {
        this.pending.delete(id);
        this.addedAt.delete(id);
      }
      this.cleanup.delete(executedHeight);
    }
    for (const [addedHeight, ids] of this.added) {
      if (addedHeight > height - this.maxAgeBlocks) break;
      for (const id of ids) {
        // Only if not re-added later (that refreshes its age).
        if (this.addedAt.get(id) !== addedHeight) continue;
        this.pending.delete(id);
        this.addedAt.delete(id);
      }
      this.added.delete(addedHeight);
    }
  }
}
