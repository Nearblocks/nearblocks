import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import health from '#services/health';

const route = Router();

const routes = (app: Router) => {
  app.use('/health', bearerAuth, rateLimiter, route);

  route.get('/indexer-base', health.base);
  route.get('/indexer-receipts', health.receipts);
};

export default routes;
