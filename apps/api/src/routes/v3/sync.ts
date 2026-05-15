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
    '/sync/status/daily-stats',
    bearerAuth,
    rateLimiter,
    service.dailyStats,
  );
};

export default routes;
