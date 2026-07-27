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

  let cursor = await getStartBlock(chain, start);
  let tip = await fetchTip();
  chainTipHeight.set({ chain }, tip);

  logger.info(
    `${chain}: tip ${tip}, start ${cursor}, lag ${Math.max(tip - cursor, 0)}`,
  );

  // eslint-disable-next-line no-constant-condition
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

    await Promise.all(
      Array.from({ length: size }, (_, i) =>
        processBlock({ chain, height: cursor + i, url }),
      ),
    );

    cursor += size;

    await updateProgress(chain, cursor);
    chainBlockHeight.set({ chain }, cursor - 1);
    chainBlocksProcessed.inc({ chain }, size);

    logger.info(
      `${chain}: ${cursor - 1} (tip ${tip}, lag ${tip - cursor + 1})`,
    );
  }
};
