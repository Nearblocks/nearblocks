import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import service from '#services/v3/sync/index';

const routes = (app: Router) => {
  app.get('/sync/status', bearerAuth, rateLimiter, service.status);
  app.get(
    '/sync/status/ft-holders',
    bearerAuth,
    rateLimiter,
    service.ftHolders,
  );
  app.get(
    '/sync/status/nft-holders',
    bearerAuth,
    rateLimiter,
    service.nftHolders,
  );
  app.get(
    '/sync/status/mt-holders',
    bearerAuth,
    rateLimiter,
    service.mtHolders,
  );
  app.get(
    '/sync/status/indexer-balance',
    bearerAuth,
    rateLimiter,
    service.balance,
  );
  app.get('/sync/status/indexer-base', bearerAuth, rateLimiter, service.base);
  app.get(
    '/sync/status/indexer-events',
    bearerAuth,
    rateLimiter,
    service.events,
  );
  app.get(
    '/sync/status/indexer-receipts',
    bearerAuth,
    rateLimiter,
    service.receipts,
  );
  app.get(
    '/sync/status/indexer-accounts',
    bearerAuth,
    rateLimiter,
    service.accounts,
  );
  app.get(
    '/sync/status/indexer-contract',
    bearerAuth,
    rateLimiter,
    service.contract,
  );
  app.get(
    '/sync/status/indexer-signature',
    bearerAuth,
    rateLimiter,
    service.signature,
  );
  app.get(
    '/sync/status/indexer-staking',
    bearerAuth,
    rateLimiter,
    service.staking,
  );
  app.get(
    '/sync/status/indexer-ft-state',
    bearerAuth,
    rateLimiter,
    service.ftState,
  );
  app.get(
    '/sync/status/indexer-intents',
    bearerAuth,
    rateLimiter,
    service.intents,
  );
  app.get(
    '/sync/status/indexer-multichain',
    bearerAuth,
    rateLimiter,
    service.multichain,
  );
  app.get('/sync/status/indexer-tvl', bearerAuth, rateLimiter, service.tvl);
  app.get(
    '/sync/status/ft-state-holders',
    bearerAuth,
    rateLimiter,
    service.ftStateHolders,
  );
  app.get(
    '/sync/status/nft-account-holders',
    bearerAuth,
    rateLimiter,
    service.nftAccountHolders,
  );
  app.get(
    '/sync/status/intents-stats',
    bearerAuth,
    rateLimiter,
    service.intentsStats,
  );
  app.get(
    '/sync/status/intents-account-stats',
    bearerAuth,
    rateLimiter,
    service.intentsAccountStats,
  );
  app.get('/sync/status/tvl-stats', bearerAuth, rateLimiter, service.tvlStats);
  app.get(
    '/sync/status/daily-stats',
    bearerAuth,
    rateLimiter,
    service.dailyStats,
  );
};

export default routes;
