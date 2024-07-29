import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import sync from '#services/sync';

const route = Router();

const routes = (app: Router) => {
  app.use('/sync', bearerAuth, rateLimiter, route);

  route.get('/status', sync.status);
  route.get('/status/ft-holders', sync.ft);
  route.get('/status/nft-holders', sync.nft);
  route.get('/status/indexer-balance', sync.balance);
  route.get('/status/indexer-base', sync.base);
  route.get('/status/indexer-events', sync.events);
  route.get('/status/daily-stats', sync.stats);
};

export default routes;
