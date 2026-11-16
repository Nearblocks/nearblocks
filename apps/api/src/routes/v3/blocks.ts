import { Router } from 'express';

import request from 'nb-schemas/dist/blocks/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/blocks/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/blocks', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/blocks:
   *   get:
   *     summary: List blocks
   *     description: >-
   *       Returns blocks newest first. Paginate by passing meta.next_page as
   *       next (or meta.prev_page as prev). Timestamps are nanoseconds and gas
   *       price is in yoctoNEAR per gas unit, both as strings.
   *     tags:
   *       - Blocks
   *     parameters:
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
   *         $ref: '#/components/responses/blocks.blocks'
   */
  route.get('/', validate(request.blocks), service.blocks);

  /**
   * @openapi
   * /v3/blocks/count:
   *   get:
   *     summary: Get estimated block count
   *     x-internal: true
   *     tags:
   *       - Blocks
   *     responses:
   *       200:
   *         $ref: '#/components/responses/blocks.count'
   */
  route.get('/count', internalOnly, service.count);

  /**
   * @openapi
   * /v3/blocks/latest:
   *   get:
   *     summary: List latest blocks
   *     description: >-
   *       Returns the most recent blocks, newest first, without pagination.
   *       ⚠️ Response is cached for 5 seconds.
   *     tags:
   *       - Blocks
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: Number of blocks to return (1-10)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 10
   *           default: 10
   *     responses:
   *       200:
   *         $ref: '#/components/responses/blocks.blocks'
   */
  route.get('/latest', validate(request.latest), service.latest);

  /**
   * @openapi
   * /v3/blocks/stats:
   *   get:
   *     summary: Get 24-hour block statistics
   *     description: >-
   *       Returns totals over the last 24 hours from hourly aggregates. Block
   *       count, average gas price, gas used and gas limit (gas units), and
   *       tokens burnt (yoctoNEAR string).
   *     tags:
   *       - Blocks
   *     responses:
   *       200:
   *         $ref: '#/components/responses/blocks.stats'
   */
  route.get('/stats', service.stats);

  /**
   * @openapi
   * /v3/blocks/{hash}:
   *   get:
   *     summary: Get block by hash or height
   *     description: >-
   *       Returns a single block looked up by base58 block hash or numeric block
   *       height. data is null if no matching block is found.
   *     tags:
   *       - Blocks
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Base58 block hash or numeric block height
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/blocks.block'
   */
  route.get('/:hash', validate(request.block), service.block);
};

export default routes;
