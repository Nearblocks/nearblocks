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
   */
  route.get('/', charts.list);

  /**
   * GET /v1/charts/latest
   * @summary Get latest charts data
   * @tags Charts
   * @return 200 - success response
   */
  route.get('/latest', charts.latest);
};

export default routes;
