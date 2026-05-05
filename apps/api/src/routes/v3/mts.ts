import { Router } from 'express';

import request from 'nb-schemas/dist/mts/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/mts/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/mt-txns', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/mt-txns:
   *   get:
   *     summary: List multi-token transfers
   *     tags:
   *       - Multi-Token
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
  route.get('/', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/mt-txns/count:
   *   get:
   *     summary: Get estimated multi-token transfer count
   *     x-internal: true
   *     tags:
   *       - Multi-Token
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
  route.get('/count', internalOnly, validate(request.count), service.count);
};

export default routes;
