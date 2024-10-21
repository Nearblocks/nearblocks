import { Router } from 'express';

import schema from '#libs/schema/account';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import activity from '#services/account/activity';
import ft from '#services/account/ft';
import account from '#services/account/index';
import key from '#services/account/key';
import nft from '#services/account/nft';
import stake from '#services/account/stake';
import txn from '#services/account/txn';

const route = Router();

const routes = (app: Router) => {
  app.use('/account', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/account/{account}
   * @summary Get account info
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} rpc.query - rpc url to use
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:account', validator(schema.item), account.item);

  /**
   * GET /v1/account/{account}/contract
   * @summary Get contract info
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} rpc.query - rpc url to use
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:account/contract', validator(schema.contract), account.contract);

  /**
   * GET /v1/account/{account}/contract/deployments
   * @summary Get contract deployment records (first & last)
   * @tags Account
   * @param {string} account.path.required - account id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/contract/deployments',
    validator(schema.deployments),
    account.deployments,
  );

  /**
   * GET /v1/account/{account}/contract/parse
   * @summary Get parsed contract info
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} rpc.query - rpc url to use
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/contract/parse',
    validator(schema.contract),
    account.parse,
  );

  /**
   * GET /v1/account/{account}/contract/{method}
   * @summary Get latest action args for contract method
   * @tags Account
   * @param {string} account.path.required - account
   * @param {string} method.path.required - method
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/contract/:method',
    validator(schema.action),
    account.action,
  );

  /**
   * GET /v1/account/{account}/inventory
   * @summary Get account ft/nft token inventory
   * @tags Account
   * @param {string} account.path.required - account id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/inventory',
    validator(schema.inventory),
    account.inventory,
  );

  /**
   * GET /v1/account/{account}/tokens
   * @summary Get possible ft/nft token contracts
   * @tags Account
   * @param {string} account.path.required - account id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:account/tokens', validator(schema.tokens), account.tokens);

  /**
   * GET /v1/account/{account}/keys
   * @summary Get access keys by pagination
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:account/keys', validator(schema.keys), key.keys);

  /**
   * GET /v1/account/{account}/keys/count
   * @summary Get estimated access keys count
   * @tags Account
   * @param {string} account.path.required - account id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:account/keys/count', validator(schema.keysCount), key.keysCount);

  /**
   * GET /v1/account/{account}/txns
   * @summary Get account txns by pagination
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} from.query - sender account id
   * @param {string} to.query - receiver account id
   * @param {string} action.query - action kind
   * @param {string} method.query - function call method
   * @param {string} after_block.query - block height
   * @param {string} before_block.query - block height
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:account/txns', validator(schema.txns), txn.txns);

  /**
   * GET /v1/account/{account}/txns/count
   * @summary Get estimated account txns count
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} from.query - sender account id
   * @param {string} to.query - receiver account id
   * @param {string} action.query - action kind
   * @param {string} method.query - function call method
   * @param {string} after_block.query - block height
   * @param {string} before_block.query - block height
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:account/txns/count', validator(schema.txnsCount), txn.txnsCount);

  /**
   * GET /v1/account/{account}/txns-only
   * @summary Get account txns without receipts by pagination
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} from.query - sender account id
   * @param {string} to.query - receiver account id
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:account/txns-only', validator(schema.txnsOnly), txn.txnsOnly);

  /**
   * GET /v1/account/{account}/txns-only/count
   * @summary Get estimated account txns without receipts count
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} from.query - sender account id
   * @param {string} to.query - receiver account id
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/txns-only/count',
    validator(schema.txnsOnlyCount),
    txn.txnsOnlyCount,
  );

  /**
   * GET /v1/account/{account}/receipts
   * @summary Get account receipts by pagination
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} from.query - sender account id
   * @param {string} to.query - receiver account id
   * @param {string} action.query - action kind
   * @param {string} method.query - function call method
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:account/receipts', validator(schema.receipts), txn.receipts);

  /**
   * GET /v1/account/{account}/receipts/count
   * @summary Get estimated account receipts count
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} from.query - sender account id
   * @param {string} to.query - receiver account id
   * @param {string} action.query - action kind
   * @param {string} method.query - function call method
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/receipts/count',
    validator(schema.receiptsCount),
    txn.receiptsCount,
  );

  /**
   * GET /v1/account/{account}/ft-txns
   * @summary Get account token txns by pagination
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} involved.query - involved account id
   * @param {string} event.query - event kind
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided - json:{"minLength": 36, "maxLength": 36}
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:account/ft-txns', validator(schema.ftTxns), ft.txns);

  /**
   * GET /v1/account/{account}/ft-txns/count
   * @summary Get estimated account token txns count
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} involved.query - involved account id
   * @param {string} event.query - event kind
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/ft-txns/count',
    validator(schema.ftTxnsCount),
    ft.txnsCount,
  );

  /**
   * GET /v1/account/{account}/nft-txns
   * @summary Get account nft txns by pagination
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} involved.query - involved account id
   * @param {string} event.query - event kind
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided - json:{"minLength": 36, "maxLength": 36}
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:account/nft-txns', validator(schema.nftTxns), nft.txns);

  /**
   * GET /v1/account/{account}/nft-txns/count
   * @summary Get estimated account nft txns count
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} involved.query - involved account id
   * @param {string} event.query - event kind
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/nft-txns/count',
    validator(schema.nftTxnsCount),
    nft.txnsCount,
  );

  /**
   * GET /v1/account/{account}/stake-txns
   * @summary Get account stake txns by pagination
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} from.query - sender account id
   * @param {string} to.query - receiver account id
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:account/stake-txns', validator(schema.stakeTxns), stake.txns);

  /**
   * GET /v1/account/{account}/stake-txns/count
   * @summary Get estimated account stake txns count
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} from.query - sender account id
   * @param {string} to.query - receiver account id
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/stake-txns/count',
    validator(schema.stakeTxnsCount),
    stake.txnsCount,
  );

  /**
   * GET /v1/account/{account}/activities
   * @summary Get account balance change activities by pagination
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided - json:{"minLength": 36, "maxLength": 36}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/activities',
    validator(schema.activities),
    activity.changes,
  );

  /**
   * GET /v1/account/{account}/activities/count
   * @summary Get estimated account balance change activities count
   * @tags Account
   * @param {string} account.path.required - account id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/activities/count',
    validator(schema.activitiesCount),
    activity.changesCount,
  );
};

export default routes;
