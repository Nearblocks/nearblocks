import { Router } from 'express';

import schema from '#libs/schema/chain-abstraction';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import chainAbstraction from '#services/chain-abstraction';

const route = Router();

const routes = (app: Router) => {
  app.use('/chain-abstraction', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/chain-abstraction/{account}/multi-chain-accounts
   * @summary Get multi chain accounts of an account
   * @tags Chain Abstraction
   * @param {string} account.path.required - account id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/multi-chain-accounts',
    validator(schema.multiChainAccounts),
    chainAbstraction.multiChainAccounts,
  );

  /**
   * GET /v1/chain-abstraction/{account}/txns
   * @summary Get multi chain txns of the account by pagination
   * @tags Chain Abstraction
   * @param {string} account.path.required - account id
   * @param {string} from.query - sender account id
   * @param {string} after_block.query - block height
   * @param {string} before_block.query - block height
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @param {string} chain.query - foreign chain
   * @param {string} multichain_address.query - multi chain address
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/txns',
    validator(schema.accountMultiChainTxns),
    chainAbstraction.multiChainTxns,
  );

  /**
   * GET /v1/chain-abstraction/{account}/txns/count
   * @summary Get estimated multi chain txns count of the account
   * @tags Chain Abstraction
   * @param {string} account.path.required - account id
   * @param {string} from.query - sender account id
   * @param {string} after_block.query - block height
   * @param {string} before_block.query - block height
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @param {string} chain.query - foreign chain
   * @param {string} multichain_address.query - multi chain address
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/txns/count',
    validator(schema.accountMultiChainTxnsCount),
    chainAbstraction.multiChainTxnsCount,
  );

  /**
   * GET /v1/chain-abstraction/txns
   * @summary Get multi chain txns by pagination
   * @tags Chain Abstraction
   * @param {string} account.path.required - account id
   * @param {string} from.query - sender account id
   * @param {string} after_block.query - block height
   * @param {string} before_block.query - block height
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @param {string} chain.query - foreign chain
   * @param {string} multichain_address.query - multi chain address
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/txns',
    validator(schema.multiChainTxns),
    chainAbstraction.multiChainTxns,
  );

  /**
   * GET /v1/chain-abstraction/txns/count
   * @summary Get estimated multi chain txns count
   * @tags Chain Abstraction
   * @param {string} account.path.required - account id
   * @param {string} from.query - sender account id
   * @param {string} after_block.query - block height
   * @param {string} before_block.query - block height
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @param {string} chain.query - foreign chain
   * @param {string} multichain_address.query - multi chain address
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/txns/count',
    validator(schema.multiChainTxnsCount),
    chainAbstraction.multiChainTxnsCount,
  );
};

export default routes;
