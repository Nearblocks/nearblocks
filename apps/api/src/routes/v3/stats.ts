import { Router } from 'express';

import request from 'nb-schemas/dist/stats/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/stats/index';

const routes = (app: Router) => {
  /**
   * @openapi
   * /v3/stats:
   *   get:
   *     summary: Stats
   *     tags:
   *       - V3 / Stats
   *     responses:
   *       200:
   *         description: Success response
   */
  app.get('/stats', bearerAuth, rateLimiter, service.stats);

  /**
   * @openapi
   * /v3/daily-stats:
   *   get:
   *     summary: Daily stats
   *     tags:
   *       - V3 / Stats
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *       - in: query
   *         name: date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  app.get(
    '/daily-stats',
    bearerAuth,
    rateLimiter,
    validate(request.daily),
    service.daily,
  );

  /**
   * @openapi
   * /v3/tps-stats:
   *   get:
   *     summary: Tps stats
   *     tags:
   *       - V3 / Stats
   *     responses:
   *       200:
   *         description: Success response
   */
  app.get('/tps-stats', bearerAuth, rateLimiter, service.tps);
};

export default routes;
