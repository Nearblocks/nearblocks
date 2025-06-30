import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import request from '#schemas/blocks/request';
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
   *       - v3/Blocks
   *     parameters:
   *       - in: query
   *         name: cursor
   *         description: Next page cursor
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of items to return
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
   *       - v3/Blocks
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
   *       - v3/Blocks
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
   *       - v3/Blocks
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Block hash or block height
   *         schema:
   *           type: string
   *         examples:
   *           hash:
   *             value: example-block-hash-or-block-height
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:hash', validate(request.block), service.block);
};

export default routes;
