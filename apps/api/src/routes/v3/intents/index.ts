import { Router } from 'express';

import request from 'nb-schemas/dist/intents/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/intents/index';

const route = Router({ mergeParams: true });

const routes = (app: Router) => {
  app.use('/intents', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/intents/txns:
   *   get:
   *     summary: List NEAR Intents transfers
   *     tags:
   *       - Intents
   *     parameters:
   *       - in: query
   *         name: before_ts
   *         description: Timestamp in nanoseconds. Return results before this timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
   *       - in: query
   *         name: next
   *         description: Next page cursor. Pass the next_page value returned from the previous response to retrieve the next page of results
   *         schema:
   *           type: string
   *       - in: query
   *         name: prev
   *         description: Previous page cursor. Pass the prev_page value returned from the previous response to retrieve the previous page of results
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/txns', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/intents/txns/count:
   *   get:
   *     summary: Get NEAR Intents transfer count
   *     tags:
   *       - Intents
   *     parameters:
   *       - in: query
   *         name: before_ts
   *         description: Timestamp in nanoseconds. Return results before this timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/txns/count', validate(request.count), service.txnCount);

  /**
   * @openapi
   * /v3/intents/volume-stats:
   *   get:
   *     summary: Get daily and cumulative NEAR Intents swap volume (USD)
   *     tags:
   *       - Intents
   *     parameters:
   *       - in: query
   *         name: date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of days to return
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/volume-stats',
    validate(request.volumeStats),
    service.volumeStats,
  );

  /**
   * @openapi
   * /v3/intents/swap-stats:
   *   get:
   *     summary: Get daily and cumulative NEAR Intents swap counts
   *     tags:
   *       - Intents
   *     parameters:
   *       - in: query
   *         name: date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of days to return
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/swap-stats', validate(request.swapStats), service.swapStats);

  /**
   * @openapi
   * /v3/intents/stats/assets:
   *   get:
   *     summary: Get daily NEAR Intents swap volume/fees/swaps broken down by asset
   *     tags:
   *       - Intents
   *     parameters:
   *       - in: query
   *         name: date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of days to return
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/stats/assets',
    validate(request.statsAssets),
    service.statsAssets,
  );

  /**
   * @openapi
   * /v3/intents/stats/blockchains:
   *   get:
   *     summary: Get daily NEAR Intents swap volume/fees/swaps broken down by blockchain
   *     tags:
   *       - Intents
   *     parameters:
   *       - in: query
   *         name: date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of days to return
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/stats/blockchains',
    validate(request.statsBlockchains),
    service.statsBlockchains,
  );

  /**
   * @openapi
   * /v3/intents/stats/overview:
   *   get:
   *     summary: Get all-time NEAR Intents swap volume/fees/swaps totals
   *     tags:
   *       - Intents
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/stats/overview', service.statsOverview);
};

export default routes;
