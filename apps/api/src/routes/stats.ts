import { Router } from 'express';

import config from '#config';
import schema from '#libs/schema/stats';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import statsProxy from '#services/proxy/stats';
import stats from '#services/stats';

const route = Router();

const service = config.v1ProxyEnabled ? statsProxy : stats;

const routes = (app: Router) => {
  app.use('/stats', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v1/stats:
   *   get:
   *     summary: Get stats
   *     tags:
   *       - Legacy / Stats
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', service.latest);

  /**
   * @openapi
   * /v1/stats/price:
   *   get:
   *     summary: Get near price
   *     tags:
   *       - Legacy / Stats
   *     parameters:
   *       - in: query
   *         name: date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/price', validator(schema.price), service.price);
};

export default routes;
