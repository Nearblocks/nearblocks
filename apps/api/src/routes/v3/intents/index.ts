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
};

export default routes;
