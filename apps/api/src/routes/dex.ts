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
   * GET /v1/dex
   * @summary Get top dex pairs by pagination
   * @tags DEX
   * @param {string} search.query - search keyword
   * @param {number} page.query - json:{"minimum": 1, "maximum": 100, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 50, "default": 50}
   * @param {string} sort.query - json:{"enum": ["volume", "txns", "makers"], "default": "volume"}
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   */
  route.get('/', validator(schema.list), dex.list);

  /**
   * GET /v1/dex/count
   * @summary Get top dex pairs count
   * @tags DEX
   * @param {number} search.query - search keyword
   * @return 200 - success response
   */
  route.get('/count', validator(schema.count), dex.count);

  /**
   * GET /v1/dex/pairs/{pair}
   * @summary Get dex pair info
   * @tags DEX
   * @param {number} pair.path.required - pair id
   * @return 200 - success response
   */
  route.get('/pairs/:pair', validator(schema.item), pair.item);

  /**
   * GET /v1/dex/pairs/{pair}/txns
   * @summary Get dex pair txns by pagination
   * @tags DEX
   * @param {number} pair.path.required - pair id
   * @param {string} a.query - maker account id
   * @param {string} cursor.query - next page cursor
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 25, "default": 25}
   * @return 200 - success response
   */
  route.get('/pairs/:pair/txns', validator(schema.txns), pair.txns);

  /**
   * GET /v1/dex/pairs/{pair}/txns/count
   * @summary Get dex pair txns count
   * @tags DEX
   * @param {number} pair.path.required - pair id
   * @param {string} a.query - maker account id
   * @return 200 - success response
   */
  route.get('/pairs/:pair/txns/count', validator(schema.txns), pair.txnsCount);

  /**
   * GET /v1/dex/pairs/{pair}/charts
   * @summary Get dex pair chart data
   * @tags DEX
   * @param {number} pair.path.required - pair id
   * @param {string} interval.query.required - json:{"enum": ["1m", "1h", "1d"], "default": "1m"}
   * @param {number} to.query.required - end timestamp
   * @param {number} limit.query.required - no of rows
   * @return 200 - success response
   */
  route.get('/pairs/:pair/charts', validator(schema.charts), pair.charts);
};

export default routes;
