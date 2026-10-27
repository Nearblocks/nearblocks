import { Message } from 'nb-neardata';
import { ActionReceiptAction, Receipt } from 'nb-types';

export type Method = 'inclusion' | 'outcome';

export type Position = {
  blockHash: string;
  blockHeight: number;
  blockTimestamp: string;
  chunkHash: string;
  index: number;
  kind: string;
  shardId: number;
};

export type ExistingRow = {
  index_in_chunk: number;
  receipt_id: string;
  shard_id: number;
};

export type Detection = {
  inclusionHits: number;
  method: Method | null;
  mixed: boolean;
  outcomeHits: number;
};

export type Candidate = {
  actions: ActionReceiptAction[];
  delayedStyle: Method | null;
  detection: Detection;
  emptyBlock: boolean;
  height: number;
  receipts: Receipt[];
  timestamp: string;
};

export type Resolved = {
  candidate: Candidate;
  inherited: boolean;
  method: Method;
};

const includedKinds = ['Action', 'Data'];
const mixedShare = 0.1;
const maxInheritGap = 5000;

export const inclusionPositions = (message: Message) => {
  const positions = new Map<string, Position>();

  message.shards.forEach((shard) => {
    const chunk = shard.chunk;

    if (!chunk) return;

    [...(chunk.receipts || []), ...(chunk.localReceipts || [])]
      .filter((receipt) =>
        includedKinds.includes(Object.keys(receipt.receipt)[0]),
      )
      .forEach((receipt, index) =>
        positions.set(receipt.receiptId, {
          blockHash: message.block.header.hash,
          blockHeight: message.block.header.height,
          blockTimestamp: message.block.header.timestampNanosec,
          chunkHash: chunk.header.chunkHash,
          index,
          kind: Object.keys(receipt.receipt)[0],
          shardId: shard.shardId,
        }),
      );
  });

  return positions;
};

export const toInclusion = (row: Receipt, position: Position): Receipt => ({
  ...row,
  included_in_block_hash: position.blockHash,
  included_in_block_timestamp: position.blockTimestamp,
  included_in_chunk_hash: position.chunkHash,
  index_in_chunk: position.index,
  shard_id: position.shardId,
});

export const actionToInclusion = (
  row: ActionReceiptAction,
  position: Position,
): ActionReceiptAction => ({
  ...row,
  index_in_chunk: position.index,
  receipt_included_in_block_timestamp: position.blockTimestamp,
  shard_id: position.shardId,
});

export const detectMethod = (
  existing: ExistingRow[],
  inclusion: Map<string, Position>,
  outcome: Map<string, Receipt>,
): Detection => {
  let inclusionHits = 0;
  let outcomeHits = 0;

  existing.forEach((row) => {
    const inc = inclusion.get(row.receipt_id);
    const out = outcome.get(row.receipt_id);
    const matchesInclusion =
      !!inc && inc.shardId === row.shard_id && inc.index === row.index_in_chunk;
    const matchesOutcome =
      !!out &&
      out.shard_id === row.shard_id &&
      out.index_in_chunk === row.index_in_chunk;

    if (matchesInclusion && !matchesOutcome) inclusionHits += 1;
    else if (matchesOutcome && !matchesInclusion) outcomeHits += 1;
  });

  const threshold = existing.length * mixedShare;

  return {
    inclusionHits,
    method:
      inclusionHits > outcomeHits
        ? 'inclusion'
        : outcomeHits > inclusionHits
          ? 'outcome'
          : null,
    mixed:
      existing.length > 0 &&
      inclusionHits >= threshold &&
      outcomeHits >= threshold,
    outcomeHits,
  };
};

export const resolveMethods = (candidates: Candidate[]): Resolved[] => {
  const ordered = [...candidates].sort((a, b) => a.height - b.height);
  const decided = ordered.filter((candidate) => candidate.detection.method);

  return ordered.map((candidate) => {
    if (candidate.detection.method) {
      return {
        candidate,
        inherited: false,
        method: candidate.detection.method,
      };
    }

    const near = decided
      .filter(
        (other) => Math.abs(other.height - candidate.height) <= maxInheritGap,
      )
      .sort(
        (a, b) =>
          Math.abs(a.height - candidate.height) -
          Math.abs(b.height - candidate.height),
      )[0];

    return {
      candidate,
      inherited: true,
      method: near?.detection.method ?? 'outcome',
    };
  });
};
