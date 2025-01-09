import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import charts from '#services/charts';

const route = Router();

const routes = (app: Router) => {
  app.use('/charts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v1/charts:
   *   get:
   *     summary: Get charts data
   *     tags:
   *       - Charts
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', charts.list);

  /**
   * @openapi
   * /v1/charts/latest:
   *   get:
   *     summary: Get latest charts data
   *     tags:
   *       - Charts
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/latest', charts.latest);

  /**
   * @openapi
   * /v1/charts/tps:
   *   get:
   *     summary: Get txns per second by shards chart data
   *     tags:
   *       - Charts
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/tps', charts.tps);
};

export default routes;
