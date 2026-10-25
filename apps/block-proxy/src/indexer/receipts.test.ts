import { describe, expect, it } from 'vitest';

import { enrichBlock, ReceiptMap, ReceiptMapFullError } from './receipts.js';
import type { IndexerBlock, ReceiptOutcome } from './receipts.js';

function receipt(
  id: string,
  children: string[] = [],
  hash?: string,
): ReceiptOutcome {
  return {
    execution_outcome: { outcome: { receipt_ids: children } },
    receipt: { receipt_id: id },
    tx_hash: hash,
  };
}
function block(receipts: ReceiptOutcome[], seeds: string[] = []): IndexerBlock {
  return {
    block: {
      chunks: [],
      header: {
        hash: 'block',
        height: 100,
        prev_hash: 'previous',
        timestamp_nanosec: '0',
      },
    },
    shards: [
      {
        chunk: {
          transactions: [
            {
              outcome: {
                execution_outcome: { outcome: { receipt_ids: seeds } },
              },
              transaction: { hash: 'tx' },
            },
          ],
        },
        receipt_execution_outcomes: receipts,
        shard_id: 0,
      },
    ],
  };
}

describe('receipt enrichment', () => {
  it('resolves multi-generation outcomes in order without mutating pending state', () => {
    const pending = new Map<string, string>();
    const value = block([receipt('a', ['b']), receipt('b', ['c'])], ['a']);
    const delta = enrichBlock(value, pending);
    expect(delta.missing).toEqual([]);
    expect(
      value.shards[0].receipt_execution_outcomes.map((r) => r.tx_hash),
    ).toEqual(['tx', 'tx']);
    expect(delta.additions.get('c')).toBe('tx');
    expect(pending.size).toBe(0);
  });

  it('resolves only from origins already seen, like neardata', () => {
    // Shard 0 executes before its parent in shard 1: FastNEAR leaves it
    // unresolved, so it must be reported rather than filled in.
    const value = block([receipt('child')]);
    value.shards.push({
      chunk: null,
      receipt_execution_outcomes: [receipt('parent', ['child'])],
      shard_id: 1,
    });
    const delta = enrichBlock(value, new Map([['parent', 'origin']]));
    expect(delta.missing).toEqual(['child']);
    expect(value.shards[0].receipt_execution_outcomes[0].tx_hash).toBeNull();
    expect(value.shards[1].receipt_execution_outcomes[0].tx_hash).toBe(
      'origin',
    );
  });

  it('propagates across shards from earlier blocks, including refunds', () => {
    const value = block([receipt('refund')]);
    value.shards.push({
      chunk: null,
      receipt_execution_outcomes: [receipt('other', ['next'])],
      shard_id: 1,
    });
    const delta = enrichBlock(
      value,
      new Map([
        ['other', 'origin-2'],
        ['refund', 'origin'],
      ]),
    );
    expect(delta.missing).toEqual([]);
    expect(value.shards[0].receipt_execution_outcomes[0].tx_hash).toBe(
      'origin',
    );
    expect(delta.additions.get('next')).toBe('origin-2');
  });

  it('ignores untrusted incoming tx_hash and reports unknown ancestry', () => {
    const value = block([receipt('unknown', [], 'untrusted')]);
    expect(enrichBlock(value, new Map()).missing).toEqual(['unknown']);
    expect(value.shards[0].receipt_execution_outcomes[0].tx_hash).toBeNull();
  });

  it('rebuilds children from enriched replay without the original transaction', () => {
    const delta = enrichBlock(
      block([receipt('old', ['child'], 'origin')]),
      new Map(),
      true,
    );
    expect(delta.additions.get('child')).toBe('origin');
    expect(delta.missing).toEqual([]);
  });

  it('rejects conflicting ancestry and duplicate executed receipt ids', () => {
    expect(() =>
      enrichBlock(
        block([receipt('a', [], 'different')]),
        new Map([['a', 'tx']]),
        true,
      ),
    ).toThrow(/conflicting/);
    expect(() =>
      enrichBlock(block([receipt('a'), receipt('a')]), new Map()),
    ).toThrow(/duplicate/);
  });

  it('retains pending ancestry beyond cleanup and removes executed entries', () => {
    const map = new ReceiptMap(100);
    map.commit(
      100,
      enrichBlock(block([receipt('a', ['pending'])], ['a']), map.pending),
    );
    map.commit(110, { additions: new Map(), executed: [], missing: [] });
    expect(map.pending.has('a')).toBe(false);
    expect(map.pending.get('pending')).toBe('tx');
    map.commit(1000, { additions: new Map(), executed: [], missing: [] });
    expect(map.pending.get('pending')).toBe('tx');
  });

  it('rejects capacity overflow before changing committed state', () => {
    const map = new ReceiptMap(1);
    expect(() =>
      map.commit(1, {
        additions: new Map([
          ['a', 'tx'],
          ['b', 'tx'],
        ]),
        executed: [],
        missing: [],
      }),
    ).toThrow(/capacity/);
    expect(map.pending.size).toBe(0);
  });

  it('clears both mapping and cleanup state before retrying startup', () => {
    const map = new ReceiptMap(10);
    map.commit(100, {
      additions: new Map([['a', 'tx']]),
      executed: ['a'],
      missing: [],
    });
    map.clear();
    map.commit(101, {
      additions: new Map([['a', 'new']]),
      executed: [],
      missing: [],
    });
    map.commit(110, { additions: new Map(), executed: [], missing: [] });
    expect(map.pending.get('a')).toBe('new');
  });

  it('expires receipts that never execute, such as data receipts', () => {
    const map = new ReceiptMap(100, 10, 50);
    const empty = { additions: new Map(), executed: [], missing: [] };
    map.commit(100, {
      additions: new Map([
        ['action', 'tx'],
        ['data', 'tx'],
      ]),
      executed: [],
      missing: [],
    });
    // The action receipt is re-added (refreshed) later; the data receipt
    // never appears again and never executes.
    map.commit(130, { ...empty, additions: new Map([['action', 'tx']]) });
    map.commit(149, empty);
    expect(map.pending.has('data')).toBe(true);
    map.commit(150, empty);
    expect(map.pending.has('data')).toBe(false);
    expect(map.pending.get('action')).toBe('tx');
  });

  it('reports a full map with a dedicated error so the follower re-anchors', () => {
    const map = new ReceiptMap(1);
    expect(() =>
      map.commit(1, {
        additions: new Map([
          ['a', 'tx'],
          ['b', 'tx'],
        ]),
        executed: [],
        missing: [],
      }),
    ).toThrow(ReceiptMapFullError);
  });
});
