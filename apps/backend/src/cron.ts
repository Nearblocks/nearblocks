import cron from 'node-cron';

import { logger } from 'nb-logger';

const options = {
  maxRandomDelay: 1000,
  noOverlap: true,
};

export const scheduleJobs = () => {
  try {
    // Stats
    cron.schedule('*/15 * * * * *', './jobs/stats.js', options); // 15s
    cron.schedule('0 1 0 * * *', './jobs/dailyStats.js', options); // every day at 00:01
    cron.schedule('0 * * * * *', './jobs/dailyStats.js', options); // temp: every minute

    // Token jobs
    cron.schedule('*/15 * * * * *', './jobs/tokenSupply.js', options); // 15s
    cron.schedule('0 * * * * *', './jobs/tokenMeta.js', options); // 1m
    cron.schedule('0 * * * * *', './jobs/tokenMarket.js', options); // 1m
    cron.schedule('0 0 0 * * *', './jobs/tokenMetaReset.js', options); // 1d

    // Validator jobs
    cron.schedule('*/15 * * * * *', './jobs/block.js', options); // 15s
    cron.schedule('0 * * * * *', './jobs/nodes.js', options); // 1m
    cron.schedule('0 0 * * * *', './jobs/pools.js', options); // 1h
    cron.schedule('0 0 */6 * * *', './jobs/protocol.js', options); // 6h
    cron.schedule('0 0 0 * * *', './jobs/genesis.js', options); // 1d

    // View refresher jobs
    cron.schedule('0 */15 * * * *', './jobs/refreshTokenList.js', options); // 15m
    cron.schedule('0 0 * * * *', './jobs/refreshStakingPools.js', options); // 1h
    cron.schedule('0 0 0 * * *', './jobs/refreshEthAccounts.js', options); // 1d
  } catch (error) {
    logger.error('Error scheduling jobs');
    logger.error(error);
  }
};
