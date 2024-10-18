import { Router } from 'express';

import schema from '#libs/schema/fts';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import contract from '#services/fts/contract';
import ft from '#services/fts/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/fts', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/fts
   * @summary Get top tokens by pagination
   * @tags FTs
   * @param {string} search.query - search keyword
   * @param {number} page.query - json:{"minimum": 1, "maximum": 100, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 50, "default": 50}
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/', validator(schema.list), ft.list);

  /**
   * GET /v1/fts/count
   * @summary Get top tokens count
   * @tags FTs
   * @param {string} search.query - search keyword
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/count', validator(schema.count), ft.count);

  /**
   * GET /v1/fts/txns
   * @summary Get token txns by pagination
   * @tags FTs
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided - json:{"minLength": 36, "maxLength": 36}
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/txns', validator(schema.txns), ft.txns);

  /**
   * GET /v1/fts/txns/count
   * @summary Get estimated token txns count
   * @tags FTs
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/txns/count', validator(schema.txnsCount), ft.txnsCount);

  /**
   * GET /v1/fts/{contract}
   * @summary Get token info
   * @tags FTs
   * @param {string} contract.path.required - contract id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:contract', validator(schema.item), contract.item);

  /**
   * GET /v1/fts/{contract}/txns
   * @summary Get token txns by pagination
   * @tags FTs
   * @param {string} contract.path.required - contract id
   * @param {string} account.query - affected account id
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided - json:{"minLength": 36, "maxLength": 36}
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:contract/txns', validator(schema.ftTxns), contract.txns);

  /**
   * GET /v1/fts/{contract}/txns/count
   * @summary Get estimated token txns count
   * @tags FTs
   * @param {string} contract.path.required - contract id
   * @param {string} account.query - affected account id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:contract/txns/count',
    validator(schema.ftTxnsCount),
    contract.txnsCount,
  );

  /**
   * GET /v1/fts/{contract}/holders
   * @summary Get token holders by pagination
   * @tags FTs
   * @param {string} contract.path.required - contract id
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:contract/holders', validator(schema.holders), contract.holders);

  /**
   * GET /v1/fts/{contract}/holders/count
   * @summary Get estimated token holders count
   * @tags FTs
   * @param {string} contract.path.required - contract id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:contract/holders/count',
    validator(schema.holdersCount),
    contract.holdersCount,
  );

  /**
   * GET /v1/fts/hex/:hex
   * @summary Convert ERC20 address to NEP141 address
   * @tags FTs
   * @param {string} hex.path.required - contract address in ERC20 standard
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/hex/:hex', validator(schema.hex), contract.hex);
};

export default routes;
