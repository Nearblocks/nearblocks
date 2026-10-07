import { logger } from 'nb-logger';
import { sleep } from 'nb-utils';

import {
  chainBlockHeight,
  chainBlocksProcessed,
  chainTipHeight,
} from '#libs/prom';
import { getStartBlock, retry, updateProgress } from '#libs/utils';
import { SyncOptions } from '#types/types';

export const syncBlocks = async ({
  chain,
  concurrency,
  getTip,
  interval,
  processBlock,
  start,
  url,
}: SyncOptions) => {
  const fetchTip = async () =>
    retry(async () => getTip(url), { chain, label: 'tip fetch' });

  const { start: startBlock, timestamp: storedTimestamp } = await getStartBlock(
    chain,
    start,
  );

  let cursor = startBlock;
  let timestamp = storedTimestamp;
  let tip = await fetchTip();
  chainTipHeight.set({ chain }, tip);

  logger.info(
    `${chain}: tip ${tip}, start ${cursor}, lag ${Math.max(tip - cursor, 0)}`,
  );

  if (timestamp === null && cursor > 0 && cursor - 1 <= tip) {
    timestamp = await processBlock({ chain, height: cursor - 1, url });

    if (timestamp !== null) await updateProgress(chain, cursor, timestamp);
  }

  while (true) {
    if (cursor > tip) {
      tip = await fetchTip();
      chainTipHeight.set({ chain }, tip);

      if (cursor > tip) {
        await sleep(interval);
        continue;
      }
    }

    const size = Math.min(concurrency, tip - cursor + 1);

    if (size > 1) {
      logger.info(
        `${chain}: fetching ${size} blocks ${cursor}..${
          cursor + size - 1
        } (tip ${tip})`,
      );
    }

    const timestamps = await Promise.all(
      Array.from({ length: size }, (_, i) =>
        processBlock({ chain, height: cursor + i, url }),
      ),
    );

    const known = timestamps.filter((value): value is number => value !== null);

    if (known.length) timestamp = Math.max(...known);

    cursor += size;

    await updateProgress(chain, cursor, timestamp);
    chainBlockHeight.set({ chain }, cursor - 1);
    chainBlocksProcessed.inc({ chain }, size);

    logger.info(
      `${chain}: ${cursor - 1} (tip ${tip}, lag ${tip - cursor + 1})`,
    );
  }
};
