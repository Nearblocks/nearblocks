import { camelCaseKeys, Message } from 'nb-neardata';
import { Network } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { dbRead } from '#scripts/db';

export type Source = { actions: number; kind: string };

const batchSize = 5;
const neardataUrl =
  config.network === Network.MAINNET
    ? 'https://mainnet.neardata.xyz'
    : 'https://testnet.neardata.xyz';

const fetchBlock = (height: number) =>
  retry(
    async () => {
      const response = await fetch(`${neardataUrl}/v0/block/${height}`, {
        signal: AbortSignal.timeout(30_000),
      });

      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`status: ${response.status}`);

      return camelCaseKeys((await response.json()) as Message);
    },
    { exponential: true, retries: 6 },
  );

const heightsOf = async (stamps: string[]) => {
  const heights = new Map<string, number>();

  for (let i = 0; i < stamps.length; i += 1000) {
    const rows = await dbRead('blocks')
      .whereIn('block_timestamp', stamps.slice(i, i + 1000))
      .select('block_height', 'block_timestamp');

    rows.forEach((row) =>
      heights.set(String(row.block_timestamp), Number(row.block_height)),
    );
  }

  return heights;
};

export const readSource = async (candidates: Map<string, string>) => {
  const heights = await heightsOf([...new Set(candidates.values())]);
  const wanted = new Map<number, Set<string>>();
  const found = new Map<string, Source>();

  candidates.forEach((stamp, id) => {
    const height = heights.get(stamp);

    if (height === undefined) return;
    if (!wanted.has(height)) wanted.set(height, new Set());

    wanted.get(height)?.add(id);
  });

  const entries = [...wanted];

  for (let i = 0; i < entries.length; i += batchSize) {
    await Promise.all(
      entries.slice(i, i + batchSize).map(async ([height, ids]) => {
        const message = await fetchBlock(height);

        message?.shards.forEach((shard) =>
          shard.receiptExecutionOutcomes.forEach(({ receipt }) => {
            if (!receipt || !ids.has(receipt.receiptId)) return;

            found.set(receipt.receiptId, {
              actions:
                'Action' in receipt.receipt
                  ? receipt.receipt.Action.actions.length
                  : 0,
              kind: Object.keys(receipt.receipt)[0],
            });
          }),
        );
      }),
    );
  }

  return found;
};
