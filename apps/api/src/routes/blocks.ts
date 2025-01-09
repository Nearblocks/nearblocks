import { Router } from 'express';

import schema from '#libs/schema/blocks';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import blocks from '#services/blocks';

const route = Router();

const routes = (app: Router) => {
  app.use('/blocks', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v1/blocks:
   *   get:
   *     summary: Get blocks by pagination
   *     tags:
   *       - Blocks
   *     parameters:
   *       - in: query
   *         name: cursor
   *         description: Next page cursor, takes precedence over 'page' if provided
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', validator(schema.list), blocks.list);

  /**
   * @openapi
   * /v1/blocks/count:
   *   get:
   *     summary: Get estimated total blocks count
   *     tags:
   *       - Blocks
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/count', blocks.count);

  /**
   * @openapi
   * /v1/blocks/latest:
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
  route.get('/latest', validator(schema.latest), blocks.latest);

  /**
   * @openapi
   * /v1/blocks/{hash}:
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
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:hash', validator(schema.item), blocks.item);
};

export default routes;
