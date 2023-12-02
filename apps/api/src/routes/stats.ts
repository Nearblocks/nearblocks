import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import stats from '#services/stats';

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
