import { Router } from 'express';

import schema from '#libs/schema/stats';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import stats from '#services/stats';

const route = Router();

const routes = (app: Router) => {
  app.use('/stats', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/stats
   * @summary Get stats
   * @tags Stats
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/', stats.latest);

  /**
   * GET /v1/stats/price
   * @summary Get near price
   * @tags Stats
   * @param {string} date.query - date in yyyy-mm-dd format
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/price', validator(schema.price), stats.price);
};

export default routes;
