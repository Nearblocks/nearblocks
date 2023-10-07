import { Router } from 'express';

import ft from '#services/fts/index';
import schema from '#libs/schema/fts';
import contract from '#services/fts/contract';
import validator from '#middlewares/validator';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';

const route = Router();

const routes = (app: Router) => {
  app.use('/fts', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/fts
   * @summary Get top tokens by pagination
   * @tags FTs
   * @param {string} search.query - search keyword
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 50, "default": 50}
   * @param {string} sort.query - json:{"enum": ["name", "price", "change", "market_cap", "onchain_market_cap", "volume", "holders"], "default": "onchain_market_cap"}
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   */
  route.get('/', validator(schema.list), ft.list);

  /**
   * GET /v1/fts/count
   * @summary Get top tokens count
   * @tags FTs
   * @param {string} search.query - search keyword
   * @return 200 - success response
   */
  route.get('/count', validator(schema.count), ft.count);

  /**
   * GET /v1/fts/txns
   * @summary Get token txns by pagination
   * @tags FTs
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 25, "default": 25}
   * @return 200 - success response
   */
  route.get('/txns', validator(schema.txns), ft.txns);

  /**
   * GET /v1/fts/txns/count
   * @summary Get token txns count
   * @tags FTs
   * @return 200 - success response
   */
  route.get('/txns/count', validator(schema.txnsCount), ft.txnsCount);

  /**
   * GET /v1/fts/{contract}
   * @summary Get token info
   * @tags FTs
   * @param {string} contract.path.required - contract id
   * @return 200 - success response
   */
  route.get('/:contract', validator(schema.item), contract.item);

  /**
   * GET /v1/fts/{contract}/txns
   * @summary Get token txns by pagination
   * @tags FTs
   * @param {string} contract.path.required - contract id
   * @param {string} from.query - sender account id
   * @param {string} to.query - receiver account id
   * @param {string} event.query - event kind
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 25, "default": 25}
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   */
  route.get('/:contract/txns', validator(schema.ftTxns), contract.txns);

  /**
   * GET /v1/fts/{contract}/txns/count
   * @summary Get token txns count
   * @tags FTs
   * @param {string} contract.path.required - contract id
   * @param {string} from.query - sender account id
   * @param {string} to.query - receiver account id
   * @param {string} event.query - event kind
   * @return 200 - success response
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
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 25, "default": 25}
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   */
  route.get('/:contract/holders', validator(schema.holders), contract.holders);

  /**
   * GET /v1/fts/{contract}/holders/count
   * @summary Get token holders count
   * @tags FTs
   * @param {string} contract.path.required - contract id
   * @return 200 - success response
   */
  route.get(
    '/:contract/holders/count',
    validator(schema.holdersCount),
    contract.holdersCount,
  );
};

export default routes;
