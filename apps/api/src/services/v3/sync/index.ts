import type {
  BlockStatus,
  DateStatus,
  MultichainStatus,
  SyncStatus,
  TvlStatus,
} from 'nb-schemas';
import response from 'nb-schemas/dist/sync/response.js';

import dayjs from '#libs/dayjs';
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
const BLOCK_HEIGHT_RANGE = 300; // ~5m of blocks — max an indexer may trail base
const CHAIN_RANGE: Record<string, number> = {
  bitcoin: 10_800, // 3h
  zcash: 1_800, // 30m
};

type Db = typeof dbBase;

const isInSync = (timestamp: string, range = BLOCK_RANGE) =>
  dayjs.utc().unix() - +timestamp.slice(0, 10) <= range;

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

// Downstream indexers consume the same stream as base (which writes `blocks`)
// but independently, so they can lead or trail it. Judge them purely by how far
// their checkpoint trails base's tip — ahead or within range is in sync. Base's
// own wall-clock freshness is checked in getBaseStatus.
const getIndexerStatus =
  (db: typeof dbBase, key: string) => async (): Promise<BlockStatus> => {
    const [setting, latestBlock] = await Promise.all([
      db.oneOrNone<{ value: { sync: string } }>(
        'SELECT value FROM settings WHERE key = $1',
        [key],
      ),
      dbBase.oneOrNone<{ block_height: string }>(
        'SELECT block_height FROM blocks ORDER BY block_height DESC LIMIT 1',
      ),
    ]);

    const indexerHeight = setting?.value?.sync;
    const latestHeight = latestBlock?.block_height;

    if (indexerHeight == null || latestHeight == null) {
      return {
        height: indexerHeight != null ? String(indexerHeight) : null,
        sync: false,
        timestamp: null,
      };
    }

    return {
      height: String(indexerHeight),
      sync: +latestHeight - +indexerHeight <= BLOCK_HEIGHT_RANGE,
      timestamp: null,
    };
  };

const getBalanceStatus = getIndexerStatus(dbBalance, 'balance');
const getEventStatus = getIndexerStatus(dbEvents, 'events');
const getReceiptsStatus = getIndexerStatus(dbBase, 'receipts');
const getAccountsStatus = getIndexerStatus(dbBase, 'accounts');
const getContractStatus = getIndexerStatus(dbContract, 'contracts');
const getSignatureStatus = getIndexerStatus(dbMultichain, 'signatures');
const getStakingStatus = getIndexerStatus(dbStaking, 'staking');

const getSetting = async <T>(db: Db, key: string) => {
  const setting = await db.oneOrNone<{ value: T }>(
    'SELECT value FROM settings WHERE key = $1',
    [key],
  );

  return setting?.value ?? null;
};

const whenTracked =
  <T>(db: Db, key: string, getStatus: () => Promise<T>) =>
  async (): Promise<T | undefined> =>
    (await getSetting(db, key)) === null ? undefined : getStatus();

const getTimestampStatus =
  (db: Db, key: string) => async (): Promise<BlockStatus> => {
    const value = await getSetting<{ sync: string }>(db, key);
    const timestamp = value?.sync;

    if (!timestamp) return { height: null, sync: false, timestamp: null };

    return {
      height: null,
      sync: isInSync(String(timestamp)),
      timestamp: String(timestamp),
    };
  };

const toDayStatus = (sync?: null | number | string): DateStatus => {
  if (sync === undefined || sync === null) return { date: null, sync: false };

  const date = dayjs.utc(Number(sync)).format('YYYY-MM-DD');

  return { date, sync: isDateInSync(date) };
};

const getDayStatus = (db: Db, key: string) => async (): Promise<DateStatus> => {
  const value = await getSetting<{ sync: string }>(db, key);

  return toDayStatus(value?.sync);
};

const getFTHoldersStatus = getTimestampStatus(dbEvents, 'ft_holders');
const getNFTHoldersStatus = getTimestampStatus(dbEvents, 'nft_holders');
const getMTHoldersStatus = getTimestampStatus(dbEvents, 'mt_holders');

const getFTStateStatus = whenTracked(
  dbEvents,
  'ft_state',
  getIndexerStatus(dbEvents, 'ft_state'),
);
const getIntentsStatus = whenTracked(
  dbEvents,
  'mt_intents_swaps',
  getTimestampStatus(dbEvents, 'mt_intents_swaps'),
);
const getFTStateHoldersStatus = whenTracked(
  dbEvents,
  'ft_state_holders',
  getTimestampStatus(dbEvents, 'ft_state_holders'),
);
const getNFTAccountHoldersStatus = whenTracked(
  dbEvents,
  'nft_account_holders',
  getTimestampStatus(dbEvents, 'nft_account_holders'),
);
const getIntentsStatsStatus = whenTracked(
  dbEvents,
  'mt_intents_stats',
  getDayStatus(dbEvents, 'mt_intents_stats'),
);
const getIntentsAccountStatsStatus = whenTracked(
  dbEvents,
  'mt_intents_account_stats',
  getDayStatus(dbEvents, 'mt_intents_account_stats'),
);

const getMultichainStatus = async (): Promise<MultichainStatus> => {
  const enabled = await getSetting<{ chains: string[] }>(
    dbMultichain,
    'mpc_chains',
  );

  if (!enabled?.chains?.length) return {};

  const settings = await dbMultichain.manyOrNone<{
    key: string;
    value: { sync: string; timestamp: null | string };
  }>('SELECT key, value FROM settings WHERE key = ANY($1)', [
    enabled.chains.map((chain) => `mpc_${chain}`),
  ]);
  const values = new Map(settings.map((row) => [row.key, row.value]));

  return Object.fromEntries(
    enabled.chains.map((chain) => {
      const value = values.get(`mpc_${chain}`);
      const timestamp = value?.timestamp ? String(value.timestamp) : null;

      return [
        chain,
        {
          height:
            value?.sync === undefined || value.sync === null
              ? null
              : String(value.sync),
          sync:
            timestamp !== null &&
            isInSync(timestamp, CHAIN_RANGE[chain] ?? BLOCK_RANGE),
          timestamp,
        },
      ];
    }),
  );
};

const getTvlStatus = (prefix: string) => async (): Promise<TvlStatus> => {
  const rows = await dbEvents.manyOrNone<{
    chain: string;
    protocol: string;
    value: { sync: string };
  }>(
    `SELECT s.protocol, s.chain, st.value
     FROM tvl_sources s
     JOIN settings st ON st.key = $1 || s.protocol || '_' || s.chain
     ORDER BY s.protocol, s.chain`,
    [prefix],
  );

  const status: TvlStatus = {};

  for (const row of rows) {
    status[row.protocol] ??= {};
    status[row.protocol][row.chain] = toDayStatus(row.value?.sync);
  }

  return status;
};

const getTvlBalancesStatus = getTvlStatus('tvl_balances_');
const getTvlStatsStatus = getTvlStatus('tvl_stats_');

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

const ftState = responseHandler(response.ftState, async () => ({
  data: (await getFTStateStatus()) ?? null,
}));

const ftStateHolders = responseHandler(response.ftStateHolders, async () => ({
  data: (await getFTStateHoldersStatus()) ?? null,
}));

const intents = responseHandler(response.intents, async () => ({
  data: (await getIntentsStatus()) ?? null,
}));

const intentsStats = responseHandler(response.intentsStats, async () => ({
  data: (await getIntentsStatsStatus()) ?? null,
}));

const intentsAccountStats = responseHandler(
  response.intentsAccountStats,
  async () => ({
    data: (await getIntentsAccountStatsStatus()) ?? null,
  }),
);

const multichain = responseHandler(response.multichain, async () => ({
  data: await getMultichainStatus(),
}));

const nftAccountHolders = responseHandler(
  response.nftAccountHolders,
  async () => ({
    data: (await getNFTAccountHoldersStatus()) ?? null,
  }),
);

const nftHolders = responseHandler(response.nftHolders, async () => ({
  data: await getNFTHoldersStatus(),
}));

const tvl = responseHandler(response.tvl, async () => ({
  data: await getTvlBalancesStatus(),
}));

const tvlStats = responseHandler(response.tvlStats, async () => ({
  data: await getTvlStatsStatus(),
}));

const mtHolders = responseHandler(response.mtHolders, async () => ({
  data: await getMTHoldersStatus(),
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
    mtData,
    statsData,
    ftStateData,
    intentsData,
    multichainData,
    tvlBalancesData,
    ftStateHoldersData,
    nftAccountHoldersData,
    intentsStatsData,
    intentsAccountStatsData,
    tvlStatsData,
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
    getMTHoldersStatus(),
    getStatStatus(),
    getFTStateStatus(),
    getIntentsStatus(),
    getMultichainStatus(),
    getTvlBalancesStatus(),
    getFTStateHoldersStatus(),
    getNFTAccountHoldersStatus(),
    getIntentsStatsStatus(),
    getIntentsAccountStatsStatus(),
    getTvlStatsStatus(),
  ]);

  const data: SyncStatus = {
    aggregates: {
      ft_holders: ftData,
      ft_state_holders: ftStateHoldersData,
      intents_account_stats: intentsAccountStatsData,
      intents_stats: intentsStatsData,
      mt_holders: mtData,
      nft_account_holders: nftAccountHoldersData,
      nft_holders: nftData,
      tvl: tvlStatsData,
    },
    indexers: {
      accounts: accountsData,
      balance: balanceData,
      base: baseData,
      contract: contractData,
      events: eventsData,
      ft_state: ftStateData,
      intents: intentsData,
      multichain: multichainData,
      receipts: receiptsData,
      signature: signatureData,
      staking: stakingData,
      tvl: tvlBalancesData,
    },
    jobs: {
      daily_stats: statsData,
    },
  };

  return { data };
});

// reused by the v1 sync/health services when config.syncV3 is on
export {
  getBalanceStatus,
  getBaseStatus,
  getEventStatus,
  getFTHoldersStatus,
  getNFTHoldersStatus,
  getReceiptsStatus,
  getStatStatus,
};

export default {
  accounts,
  balance,
  base,
  contract,
  dailyStats,
  events,
  ftHolders,
  ftState,
  ftStateHolders,
  intents,
  intentsAccountStats,
  intentsStats,
  mtHolders,
  multichain,
  nftAccountHolders,
  nftHolders,
  receipts,
  signature,
  staking,
  status,
  tvl,
  tvlStats,
};
