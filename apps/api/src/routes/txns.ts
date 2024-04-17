import { Router } from 'express';

import schema from '#libs/schema/txns';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import txns from '#services/txns';

const route = Router();

const routes = (app: Router) => {
  app.use('/txns', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/txns
   * @summary Get txns by pagination
   * @tags Txns
   * @param {string} block.query - block hash
   * @param {string} from.query - sender account id
   * @param {string} to.query - receiver account id
   * @param {string} action.query - action kind
   * @param {string} method.query - function call method
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 25, "default": 25}
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   */
  route.get('/', validator(schema.list), txns.list);

  /**
   * GET /v1/txns/count
   * @summary Get total txns count
   * @tags Txns
   * @param {string} block.query - block hash
   * @param {string} from.query - sender account id
   * @param {string} to.query - receiver account id
   * @param {string} action.query - action kind
   * @param {string} method.query - function call method
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @return 200 - success response
   */
  route.get('/count', validator(schema.count), txns.count);

  /**
   * GET /v1/txns/latest
   * @summary Get the latest txns
   * @tags Txns
   * @param {number} limit.query - json:{"minimum": 1, "maximum": 10, "default": 10}
   * @return 200 - success response
   */
  route.get('/latest', validator(schema.latest), txns.latest);

  /**
   * GET /v1/txns/{hash}
   * @summary Get txn info
   * @tags Txns
   * @param {string} hash.path.required - txn hash
   * @return 200 - success response
   */
  route.get('/:hash', validator(schema.item), txns.item);
};

export default routes;
