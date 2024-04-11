import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import sync from '#services/sync';

const route = Router();

const routes = (app: Router) => {
  app.use('/sync', bearerAuth, rateLimiter, route);

  route.get('/status', sync.status);
};

export default routes;
