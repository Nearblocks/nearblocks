import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import charts from '#services/charts';

const route = Router();

const routes = (app: Router) => {
  app.use('/charts', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/charts
   * @summary Get charts data
   * @tags Charts
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/', charts.list);

  /**
   * GET /v1/charts/latest
   * @summary Get latest charts data
   * @tags Charts
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/latest', charts.latest);

  /**
   * GET /v1/charts/tps
   * @summary Get txns per second by shards chart data
   * @tags Charts
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/tps', charts.tps);
};

export default routes;
