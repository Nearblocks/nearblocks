import { Router } from 'express';

import stats from '#services/stats';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';

const route = Router();

const routes = (app: Router) => {
  app.use('/stats', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/stats
   * @summary Get stats
   * @tags Stats
   * @return 200 - success response
   */
  route.get('/', stats.latest);
};

export default routes;
