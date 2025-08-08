import { Router } from 'express';

import request from 'nb-schemas/dist/blocks/request.js';

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
   *     summary: Get all blocks
   *     tags:
   *       - V3 / Blocks
   *     parameters:
   *       - in: query
   *         name: cursor
   *         description: Page cursor. Pass the value returned from the previous request to retrieve the next page of results
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
  route.get('/', validate(request.blocks), service.blocks);

  /**
   * @openapi
   * /v3/blocks/count:
   *   get:
   *     summary: Get estimated blocks count
   *     tags:
   *       - V3 / Blocks
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/count', service.count);

  /**
   * @openapi
   * /v3/blocks/latest:
   *   get:
   *     summary: Get the latest blocks
   *     description: ⚠️ Response is cached for 5 seconds
   *     tags:
   *       - V3 / Blocks
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: The number of items to return
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 10
   *           default: 10
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/latest', validate(request.latest), service.latest);

  /**
   * @openapi
   * /v3/blocks/{hash}:
   *   get:
   *     summary: Get a block
   *     tags:
   *       - V3 / Blocks
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Block hash or block height to retrieve
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:hash', validate(request.block), service.block);
};

export default routes;
