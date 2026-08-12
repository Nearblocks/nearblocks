/* eslint-disable no-await-in-loop */
import { getBlockHeader, getLatestBlock } from '#libs/evm';
import { db } from '#libs/knex';
import { retry } from '#libs/utils';

const headerTimestampSec = async (url: string, height: number) => {
  const header = await retry(() => getBlockHeader(url, height), {
    label: `header ${height}`,
  });

  if (!header) return null;

  return parseInt(header.timestamp, 16);
};

export const getDayBlock = async (
  chain: string,
  url: string,
  dateMs: bigint,
  startBlock = 0,
): Promise<null | number> => {
  const cached = await db('tvl_daily_blocks')
    .where({ chain, date: dateMs.toString() })
    .first();

  if (cached) return Number(cached.block_height);

  const targetSec = Number(dateMs / 1000n);

  const tip = await retry(() => getLatestBlock(url), { label: 'tip' });
  const tipTs = await headerTimestampSec(url, tip);

  if (tipTs === null || tipTs < targetSec) return null; // chain hasn't reached this day yet

  let lo = 0;

  if (startBlock > 0) {
    const startTs = await headerTimestampSec(url, startBlock);

    if (startTs !== null && startTs <= targetSec) lo = startBlock;
  }

  let hi = tip;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const ts = await headerTimestampSec(url, mid);

    if (ts === null || ts < targetSec) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  await db('tvl_daily_blocks')
    .insert({ block_height: lo, chain, date: dateMs.toString() })
    .onConflict(['chain', 'date'])
    .ignore();

  return lo;
};
