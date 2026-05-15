import type { BlockStatus, DateStatus, SyncStatus } from 'nb-schemas';
import response from 'nb-schemas/dist/sync/response.js';

import dayjs from '#libs/dayjs';
import logger from '#libs/logger';
import {
  dbBalance,
  dbBase,
  dbContract,
  dbEvents,
  dbMultichain,
  dbStaking,
} from '#libs/pgp';
import { responseHandler } from '#middlewares/response';

const DATE_RANGE = 2; // 2d
const BLOCK_RANGE = 600; // 10m

const isInSync = (timestamp: string) =>
  dayjs.utc().unix() - +timestamp.slice(0, 10) <= BLOCK_RANGE;

const isDateInSync = (date: string) =>
  dayjs.utc().diff(dayjs.utc(date), 'day') <= DATE_RANGE;

const getBaseStatus = async (): Promise<BlockStatus> => {
  const latestBlock = await dbBase.oneOrNone<{
    block_height: string;
    block_timestamp: string;
  }>(
    'SELECT block_height, block_timestamp FROM blocks ORDER BY block_height DESC LIMIT 1',
  );

  if (!latestBlock) return { height: null, sync: false, timestamp: null };

  return {
    height: String(latestBlock.block_height),
    sync: isInSync(String(latestBlock.block_timestamp)),
    timestamp: String(latestBlock.block_timestamp),
  };
};

const getIndexerStatus =
  (db: typeof dbBase, key: string) => async (): Promise<BlockStatus> => {
    const setting = await db.oneOrNone<{ value: { sync: string } }>(
      'SELECT value FROM settings WHERE key = $1',
      [key],
    );
    const indexerHeight = setting?.value?.sync;

    if (!indexerHeight) return { height: null, sync: false, timestamp: null };

    const syncedBlock = await dbBase.oneOrNone<{
      block_height: string;
      block_timestamp: string;
    }>(
      'SELECT block_height, block_timestamp FROM blocks WHERE block_height IN ($1:csv) LIMIT 1',
      [[+indexerHeight, +indexerHeight - 1, +indexerHeight - 2]],
    );

    if (!syncedBlock) {
      logger.warn({ indexerHeight, key });
      return { height: String(indexerHeight), sync: false, timestamp: null };
    }

    return {
      height: String(syncedBlock.block_height),
      sync: isInSync(String(syncedBlock.block_timestamp)),
      timestamp: String(syncedBlock.block_timestamp),
    };
  };

const getBalanceStatus = getIndexerStatus(dbBalance, 'balance');
const getEventStatus = getIndexerStatus(dbEvents, 'events');
const getReceiptsStatus = getIndexerStatus(dbBase, 'receipts');
const getAccountsStatus = getIndexerStatus(dbBase, 'accounts');
const getContractStatus = getIndexerStatus(dbContract, 'contracts');
const getSignatureStatus = getIndexerStatus(dbMultichain, 'signatures');
const getStakingStatus = getIndexerStatus(dbStaking, 'staking');

const getFTHoldersStatus = async (): Promise<BlockStatus> => {
  const ftSetting = await dbEvents.oneOrNone<{ value: { sync: string } }>(
    'SELECT value FROM settings WHERE key = $1',
    ['ft_holders'],
  );
  const ftHoldersTs = ftSetting?.value?.sync;

  if (!ftHoldersTs) return { height: null, sync: false, timestamp: null };

  // aggregates store nanosecond timestamps, not block heights
  // isInSync slices first 10 digits → unix seconds, works for ns timestamps too
  return {
    height: null,
    sync: isInSync(String(ftHoldersTs)),
    timestamp: String(ftHoldersTs),
  };
};

const getNFTHoldersStatus = async (): Promise<BlockStatus> => {
  const nftSetting = await dbEvents.oneOrNone<{ value: { sync: string } }>(
    'SELECT value FROM settings WHERE key = $1',
    ['nft_holders'],
  );
  const nftHoldersTs = nftSetting?.value?.sync;

  if (!nftHoldersTs) return { height: null, sync: false, timestamp: null };

  // aggregates store nanosecond timestamps, not block heights
  return {
    height: null,
    sync: isInSync(String(nftHoldersTs)),
    timestamp: String(nftHoldersTs),
  };
};

const getStatStatus = async (): Promise<DateStatus> => {
  const stats = await dbBase.oneOrNone<{ date: string }>(
    "SELECT TO_CHAR(TO_TIMESTAMP(date / 1e9), 'YYYY-MM-DD') AS date FROM daily_stats ORDER BY date DESC LIMIT 1",
  );
  const date = stats?.date ?? null;

  if (!date) return { date, sync: false };

  return { date, sync: isDateInSync(date) };
};

const accounts = responseHandler(response.accounts, async () => ({
  data: await getAccountsStatus(),
}));

const balance = responseHandler(response.balance, async () => ({
  data: await getBalanceStatus(),
}));

const base = responseHandler(response.base, async () => ({
  data: await getBaseStatus(),
}));

const contract = responseHandler(response.contract, async () => ({
  data: await getContractStatus(),
}));

const events = responseHandler(response.events, async () => ({
  data: await getEventStatus(),
}));

const ftHolders = responseHandler(response.ftHolders, async () => ({
  data: await getFTHoldersStatus(),
}));

const nftHolders = responseHandler(response.nftHolders, async () => ({
  data: await getNFTHoldersStatus(),
}));

const receipts = responseHandler(response.receipts, async () => ({
  data: await getReceiptsStatus(),
}));

const signature = responseHandler(response.signature, async () => ({
  data: await getSignatureStatus(),
}));

const staking = responseHandler(response.staking, async () => ({
  data: await getStakingStatus(),
}));

const dailyStats = responseHandler(response.dailyStats, async () => ({
  data: await getStatStatus(),
}));

const status = responseHandler(response.status, async () => {
  const [
    baseData,
    balanceData,
    eventsData,
    accountsData,
    contractData,
    receiptsData,
    signatureData,
    stakingData,
    ftData,
    nftData,
    statsData,
  ] = await Promise.all([
    getBaseStatus(),
    getBalanceStatus(),
    getEventStatus(),
    getAccountsStatus(),
    getContractStatus(),
    getReceiptsStatus(),
    getSignatureStatus(),
    getStakingStatus(),
    getFTHoldersStatus(),
    getNFTHoldersStatus(),
    getStatStatus(),
  ]);

  const data: SyncStatus = {
    aggregates: {
      ft_holders: ftData,
      nft_holders: nftData,
    },
    indexers: {
      accounts: accountsData,
      balance: balanceData,
      base: baseData,
      contract: contractData,
      events: eventsData,
      receipts: receiptsData,
      signature: signatureData,
      staking: stakingData,
    },
    jobs: {
      daily_stats: statsData,
    },
  };

  return { data };
});

export default {
  accounts,
  balance,
  base,
  contract,
  dailyStats,
  events,
  ftHolders,
  nftHolders,
  receipts,
  signature,
  staking,
  status,
};
