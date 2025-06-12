import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import schema from '#schemas/blocks/request';
import service from '#services/v3/blocks/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/blocks', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/blocks:
   *   get:
   *     summary: Get blocks by pagination
   *     tags:
   *       - Blocks
   *     parameters:
   *       - in: query
   *         name: cursor
   *         description: Next page cursor
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of items per page. Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', validate(schema.blockList), service.blockList);

  /**
   * @openapi
   * /v3/blocks/count:
   *   get:
   *     summary: Get estimated total blocks count
   *     tags:
   *       - Blocks
   *     responses:
   *       200:
   *         description: Success response
   */
  // route.get('/count', blocks.count);

  /**
   * @openapi
   * /v3/blocks/latest:
   *   get:
   *     summary: Get the latest blocks
   *     tags:
   *       - Blocks
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: Number of latest blocks to retrieve
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 10
   *           default: 10
   *     responses:
   *       200:
   *         description: Success response
   */
  // route.get('/latest', validatorV3(schema.latest), blocks.latest);

  /**
   * @openapi
   * /v3/blocks/{hash}:
   *   get:
   *     summary: Get block info
   *     tags:
   *       - Blocks
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Block hash
   *         schema:
   *           type: string
   *         examples:
   *           hash:
   *             value: example-block-hash
   *     responses:
   *       200:
   *         description: Success response
   */
  // route.get('/:hash', validatorV3(schema.item), blocks.item);
};

export default routes;
