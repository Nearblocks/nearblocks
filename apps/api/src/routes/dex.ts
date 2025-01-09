import { Router } from 'express';

import schema from '#libs/schema/dex';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import dex from '#services/dex/index';
import pair from '#services/dex/pair';

const route = Router();

const routes = (app: Router) => {
  app.use('/dex', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v1/dex:
   *   get:
   *     summary: Get top dex pairs by pagination
   *     tags:
   *       - DEX
   *     parameters:
   *       - in: query
   *         name: search
   *         description: Search keyword
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 100
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 50
   *           default: 50
   *       - in: query
   *         name: sort
   *         description: Sort field
   *         schema:
   *           type: string
   *           enum: [volume, txns, makers]
   *           default: volume
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
  route.get('/', validator(schema.list), dex.list);

  /**
   * @openapi
   * /v1/dex/count:
   *   get:
   *     summary: Get top dex pairs count
   *     tags:
   *       - DEX
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
  route.get('/count', validator(schema.count), dex.count);

  /**
   * @openapi
   * /v1/dex/pairs/{pair}:
   *   get:
   *     summary: Get dex pair info
   *     tags:
   *       - DEX
   *     parameters:
   *       - in: path
   *         name: pair
   *         required: true
   *         description: Pair ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/pairs/:pair', validator(schema.item), pair.item);

  /**
   * @openapi
   * /v1/dex/pairs/{pair}/txns:
   *   get:
   *     summary: Get dex pair txns by pagination
   *     tags:
   *       - DEX
   *     parameters:
   *       - in: path
   *         name: pair
   *         required: true
   *         description: Pair ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: a
   *         description: Maker account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: cursor
   *         description: Next page cursor
   *         schema:
   *           type: string
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/pairs/:pair/txns', validator(schema.txns), pair.txns);

  /**
   * @openapi
   * /v1/dex/pairs/{pair}/txns/count:
   *   get:
   *     summary: Get dex pair txns count
   *     tags:
   *       - DEX
   *     parameters:
   *       - in: path
   *         name: pair
   *         required: true
   *         description: Pair ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: a
   *         description: Maker account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/pairs/:pair/txns/count', validator(schema.txns), pair.txnsCount);

  /**
   * @openapi
   * /v1/dex/pairs/{pair}/charts:
   *   get:
   *     summary: Get dex pair chart data
   *     tags:
   *       - DEX
   *     parameters:
   *       - in: path
   *         name: pair
   *         required: true
   *         description: Pair ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: interval
   *         required: true
   *         description: Time interval
   *         schema:
   *           type: string
   *           enum: [1m, 1h, 1d]
   *           default: 1m
   *       - in: query
   *         name: to
   *         required: true
   *         description: End timestamp
   *         schema:
   *           type: number
   *       - in: query
   *         name: limit
   *         required: true
   *         description: Number of rows
   *         schema:
   *           type: number
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/pairs/:pair/charts', validator(schema.charts), pair.charts);
};

export default routes;
