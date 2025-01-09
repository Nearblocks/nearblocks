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
   * @openapi
   * /v1/stats:
   *   get:
   *     summary: Get stats
   *     tags:
   *       - Stats
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', stats.latest);

  /**
   * @openapi
   * /v1/stats/price:
   *   get:
   *     summary: Get near price
   *     tags:
   *       - Stats
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
  route.get('/price', validator(schema.price), stats.price);
};

export default routes;
