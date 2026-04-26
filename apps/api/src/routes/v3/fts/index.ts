import { Router } from 'express';

import request from 'nb-schemas/dist/fts/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import contract from '#routes/v3/fts/contract';
import service from '#services/v3/fts/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/fts', bearerAuth, rateLimiter, route);

  contract(app);

  /**
   * @openapi
   * /v3/fts:
   *   get:
   *     summary: List top fungible tokens
   *     tags:
   *       - V3 / FTs
   *     parameters:
   *       - in: query
   *         name: search
   *         description: Search keyword
   *         schema:
   *           type: string
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
   *       - in: query
   *         name: sort
   *         description: Sort field
   *         schema:
   *           type: string
   *           enum: [market_cap, name, onchain_market_cap, price, volume_24h]
   *           default: onchain_market_cap
   *       - in: query
   *         name: order
   *         description: Sort order
   *         schema:
   *           type: string
   *           enum: [desc, asc]
   *           default: desc
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', validate(request.list), service.list);

  /**
   * @openapi
   * /v3/fts/count:
   *   get:
   *     summary: Get fungible token count
   *     x-internal: true
   *     tags:
   *       - V3 / FTs
   *     parameters:
   *       - in: query
   *         name: search
   *         description: Search keyword
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/count', internalOnly, validate(request.count), service.count);

  /**
   * @openapi
   * /v3/fts/txns:
   *   get:
   *     summary: List all FT transfers
   *     tags:
   *       - V3 / FTs
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
   * /v3/fts/txns/count:
   *   get:
   *     summary: Get FT transfer count
   *     x-internal: true
   *     tags:
   *       - V3 / FTs
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
  route.get(
    '/txns/count',
    internalOnly,
    validate(request.txnCount),
    service.txnCount,
  );

  return app;
};

export default routes;
