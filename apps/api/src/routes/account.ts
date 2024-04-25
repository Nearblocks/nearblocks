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
   * @return 200 - success response
   */
  route.get('/:account', validator(schema.item), account.item);

  /**
   * GET /v1/account/{account}/contract
   * @summary Get contract info
   * @tags Account
   * @param {string} account.path.required - account id
   * @return 200 - success response
   */
  route.get('/:account/contract', validator(schema.contract), account.contract);

  /**
   * GET /v1/account/{account}/contract/deployments
   * @summary Get contract deployment records (first & last)
   * @tags Account
   * @param {string} account.path.required - account id
   * @return 200 - success response
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
   * @return 200 - success response
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
   */
  route.get('/:account/tokens', validator(schema.tokens), account.tokens);

  /**
   * GET /v1/account/{account}/keys
   * @summary Get access keys by pagination
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 25, "default": 25}
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   */
  route.get('/:account/keys', validator(schema.keys), key.keys);

  /**
   * GET /v1/account/{account}/keys/count
   * @summary Get access keys count
   * @tags Account
   * @param {string} account.path.required - account id
   * @return 200 - success response
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
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 25, "default": 25}
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   */
  route.get('/:account/txns', validator(schema.txns), txn.txns);

  /**
   * GET /v1/account/{account}/txns/count
   * @summary Get account txns count
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} from.query - sender account id
   * @param {string} to.query - receiver account id
   * @param {string} action.query - action kind
   * @param {string} method.query - function call method
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @return 200 - success response
   */
  route.get('/:account/txns/count', validator(schema.txnsCount), txn.txnsCount);

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
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 25, "default": 25}
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   */
  route.get('/:account/ft-txns', validator(schema.ftTxns), ft.txns);

  /**
   * GET /v1/account/{account}/ft-txns/count
   * @summary Get account token txns count
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} involved.query - involved account id
   * @param {string} event.query - event kind
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @return 200 - success response
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
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 25, "default": 25}
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   */
  route.get('/:account/nft-txns', validator(schema.nftTxns), nft.txns);

  /**
   * GET /v1/account/{account}/nft-txns/count
   * @summary Get account nft txns count
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} involved.query - involved account id
   * @param {string} event.query - event kind
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @return 200 - success response
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
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 25, "default": 25}
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   */
  route.get('/:account/stake-txns', validator(schema.stakeTxns), stake.txns);

  /**
   * GET /v1/account/{account}/stake-txns/count
   * @summary Get account stake txns count
   * @tags Account
   * @param {string} account.path.required - account id
   * @param {string} from.query - sender account id
   * @param {string} to.query - receiver account id
   * @param {string} after_date.query - date in YYYY-MM-DD format
   * @param {string} before_date.query - date in YYYY-MM-DD format
   * @return 200 - success response
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
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 25, "default": 25}
   * @return 200 - success response
   */
  route.get(
    '/:account/activities',
    validator(schema.activities),
    activity.changes,
  );

  /**
   * GET /v1/account/{account}/activities/count
   * @summary Get account balance change activities count
   * @tags Account
   * @param {string} account.path.required - account id
   * @return 200 - success response
   */
  route.get(
    '/:account/activities/count',
    validator(schema.activitiesCount),
    activity.changesCount,
  );
};

export default routes;
