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
   * GET /v1/blocks
   * @summary Get blocks by pagination
   * @tags Blocks
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/', validator(schema.list), blocks.list);

  /**
   * GET /v1/blocks/count
   * @summary Get estimated total blocks count
   * @tags Blocks
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/count', blocks.count);

  /**
   * GET /v1/blocks/latest
   * @summary Get the latest blocks
   * @tags Blocks
   * @param {number} limit.query - json:{"minimum": 1, "maximum": 10, "default": 10}
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/latest', validator(schema.latest), blocks.latest);

  /**
   * GET /v1/blocks/{hash}
   * @summary Get block info
   * @tags Blocks
   * @param {string} hash.path.required - block hash
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:hash', validator(schema.item), blocks.item);
};

export default routes;
