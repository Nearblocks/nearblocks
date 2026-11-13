import { describe, expect, it } from 'vitest';

import type { AccountAssetFT, AccountAssetNFT, TxnDetail } from 'nb-schemas';

import * as adapt from '#services/compat/adapters';

const receipt = (id: string, ts: string, receipts: unknown[] = []) => ({
  actions: [],
  block: { block_hash: `b${id}`, block_height: '10', block_timestamp: ts },
  outcome: { status: true },
  predecessor_account_id: 'a.near',
  public_key: 'pk',
  receipt_id: id,
  receipts,
  receiver_account_id: 'b.near',
});

const detail = {
  fts: [
    {
      affected_account_id: 'b.near',
      block_timestamp: '2',
      cause: 'TRANSFER',
      contract_account_id: 'ft.near',
      delta_amount: '5',
      event_index: 0,
      event_type: 1,
      involved_account_id: 'a.near',
      meta: { contract: 'ft.near', decimals: 6, icon: null, name: 'FT' },
      receipt_id: 'r2',
      shard_id: 3,
    },
  ],
  mts: [],
  nfts: [],
  receipts: receipt('r1', '1', [receipt('r3', '3'), receipt('r2', '2')]),
  txn: {
    actions: [
      {
        action: 'FUNCTION_CALL',
        args: { args_json: { a: 1 }, method_name: 'go' },
        method: 'go',
        rlp_hash: null,
      },
    ],
    actions_agg: { deposit: '1000', gas_attached: '30' },
    block: { block_hash: 'bh', block_height: '10', block_timestamp: '1' },
    block_timestamp: '1',
    index_in_chunk: 0,
    outcomes: { status: true },
    outcomes_agg: { gas_used: '20', transaction_fee: '7' },
    receipt_conversion_gas_burnt: '2',
    receipt_conversion_tokens_burnt: '3',
    receiver_account_id: 'b.near',
    shard_id: 3,
    signer_account_id: 'a.near',
    transaction_hash: 'h',
  },
} as unknown as TxnDetail;

describe('compat adapters', () => {
  it('builds a 35-digit, ordered synthetic event index', () => {
    const e = { block_timestamp: '1700000000000000000', event_index: 7 };
    const a = adapt.eventIndex({ ...e, event_type: 1, shard_id: 2 });
    const b = adapt.eventIndex({ ...e, event_index: 8, shard_id: 2 });
    expect(a).toHaveLength(35);
    expect(a.startsWith(e.block_timestamp)).toBe(true);
    expect(a < adapt.eventIndex({ ...e, event_type: 1, shard_id: 3 })).toBe(
      true,
    );
    expect(b).not.toBe(a);
  });

  it('maps a v3 txn detail to the v1 shape', () => {
    const txn = adapt.txnV1(detail);
    expect(txn.actions[0].args).toBe('{"a":1}');
    expect(txn.actions_agg).toEqual({ deposit: 1000, gas_attached: 30 });
    expect(txn.block).toEqual({ block_height: 10 });
    expect(txn.shard_id).toBe('3');
    // Receipts ordered by block time; events attached to their receipt.
    expect(txn.receipts.map((r) => r.fts.length)).toEqual([0, 1, 0]);
    expect(txn.receipts[1].fts[0].delta_amount).toBe(5);
  });

  it('maps a v3 txn detail to the v2 shape', () => {
    const txn = adapt.txnV2(detail);
    expect(txn.actions[0].args).toBe(
      '{"args_json":{"a":1},"method_name":"go"}',
    );
    expect(txn.receipts.map((r) => r.receipt_id)).toEqual(['r1', 'r2', 'r3']);
    expect(txn.receipts[1].fts[0].delta_amount).toBe('5');
    expect(txn.receipts[0].block.block_height).toBe(10);
  });

  it('groups NFTs by contract and renames the aurora FT', () => {
    const fts = [{ amount: '1', contract: 'aurora' }] as AccountAssetFT[];
    const nfts = [
      { contract: 'x.near', token: '1' },
      { contract: 'y.near', token: '1' },
      { contract: 'y.near', token: '2' },
    ] as AccountAssetNFT[];
    const inv = adapt.inventory(fts, nfts);
    expect(inv.fts[0].contract).toBe('eth.bridge.near');
    expect(inv.nfts.map((n) => [n.contract, n.quantity])).toEqual([
      ['y.near', '2'],
      ['x.near', '1'],
    ]);
  });
});
