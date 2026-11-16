import { Router } from 'express';

import request from 'nb-schemas/dist/receipts/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/receipts/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/receipts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/receipts:
   *   get:
   *     summary: List receipts
   *     description: >-
   *       Returns receipts newest first, optionally limited to one block or to
   *       those before a timestamp. Paginate by passing meta.next_page as next
   *       (or meta.prev_page as prev). Timestamps are nanosecond strings.
   *     tags:
   *       - Receipts
   *     parameters:
   *       - in: query
   *         name: block
   *         description: Only return receipts included in this block hash
   *         schema:
   *           type: string
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
   *         $ref: '#/components/responses/receipts.receipts'
   */
  route.get('/', validate(request.receipts), service.receipts);

  /**
   * @openapi
   * /v3/receipts/count:
   *   get:
   *     summary: Get estimated receipt count
   *     x-internal: true
   *     tags:
   *       - Receipts
   *     parameters:
   *       - in: query
   *         name: block
   *         description: Block hash to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_ts
   *         description: Timestamp in nanoseconds. Return results before this timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
   *     responses:
   *       200:
   *         $ref: '#/components/responses/receipts.count'
   */
  route.get('/count', internalOnly, validate(request.count), service.count);
};

export default routes;
