import type { IndexerBlock } from './receipts.js';

type JsonParseContext = { source?: string };

const rawJson = (
  JSON as typeof JSON & {
    rawJSON: (source: string) => unknown;
  }
).rawJSON;

export function rawJsonNumber(source: string): number {
  return rawJson(source) as number;
}

/** Preserve exact JSON integer tokens outside JavaScript's safe range. */
export function parseJsonPreservingUnsafeIntegers<T>(source: string): T {
  const reviver = (
    _key: string,
    value: unknown,
    context?: JsonParseContext,
  ): unknown => {
    if (
      typeof value === 'number' &&
      !Number.isSafeInteger(value) &&
      context?.source &&
      /^-?\d+$/.test(context.source)
    ) {
      return rawJson(context.source);
    }
    return value;
  };
  return JSON.parse(source, reviver as never) as T;
}

export function validateBlock(
  message: IndexerBlock,
  block: IndexerBlock['block'],
  trackedRequired = true,
): void {
  if (
    message.block.header.hash !== block.header.hash ||
    message.block.header.height !== block.header.height
  ) {
    throw new Error('indexer block identity mismatch');
  }
  const tracked = new Set(message.tracked_shards);
  const shards = new Map(message.shards.map((s) => [s.shard_id, s]));
  if (
    shards.size !== block.chunks.length ||
    message.shards.length !== shards.size ||
    block.chunks.some(
      (c) =>
        (trackedRequired && !tracked.has(c.shard_id)) ||
        !shards.has(c.shard_id) ||
        (c.height_included === block.header.height &&
          !shards.get(c.shard_id)!.chunk),
    )
  ) {
    throw new Error('indexer requires complete all-shard tracking');
  }
  for (const shard of message.shards) {
    for (const tx of shard.chunk?.transactions ?? []) {
      if (
        typeof tx.transaction.hash !== 'string' ||
        !tx.transaction.hash ||
        !Array.isArray(tx.outcome.execution_outcome.outcome.receipt_ids) ||
        tx.outcome.execution_outcome.outcome.receipt_ids.some(
          (id) => typeof id !== 'string' || !id,
        )
      ) {
        throw new Error('invalid transaction outcome');
      }
    }
    for (const receipt of shard.receipt_execution_outcomes) {
      if (
        typeof receipt.receipt.receipt_id !== 'string' ||
        !receipt.receipt.receipt_id ||
        !Array.isArray(receipt.execution_outcome.outcome.receipt_ids) ||
        receipt.execution_outcome.outcome.receipt_ids.some(
          (id) => typeof id !== 'string' || !id,
        )
      ) {
        throw new Error('invalid receipt outcome');
      }
    }
  }
}

export class NodeRpc {
  private id = 0;
  constructor(
    private readonly url: string,
    private readonly timeoutMs: number,
  ) {}

  block(
    reference: { block_id: number | string } | { finality: 'final' },
  ): Promise<IndexerBlock['block']> {
    return this.call('block', reference);
  }

  async call<T>(method: string, params: unknown): Promise<T> {
    const response = await fetch(this.url, {
      body: JSON.stringify({ id: ++this.id, jsonrpc: '2.0', method, params }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!response.ok) throw new Error(`node rpc http ${response.status}`);
    const reader = response.body!.getReader();
    const parts: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 40 * 1024 * 1024)
          throw new Error('node rpc response too large');
        parts.push(value);
      }
    } finally {
      await reader.cancel();
    }
    const result = parseJsonPreservingUnsafeIntegers<{
      error?: unknown;
      result?: T;
    }>(Buffer.concat(parts).toString('utf8'));
    if (result.error)
      throw new Error(`node rpc ${method}: ${JSON.stringify(result.error)}`);
    if (!result.result) throw new Error('node rpc result missing');
    return result.result as T;
  }

  async indexer(block: IndexerBlock['block']): Promise<IndexerBlock> {
    const message = await this.call<IndexerBlock>(
      'EXPERIMENTAL_indexer_block',
      {
        block_hash: block.header.hash,
      },
    );
    validateBlock(message, block);
    return message;
  }
}
