import { Router } from 'express';

import accountSchema from '#libs/schema/account';
import schema from '#libs/schema/kitwallet';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import account from '#services/account/txn';
import kitwallet from '#services/kitwallet';

const route = Router();

const routes = (app: Router) => {
  app.use('/kitwallet', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/kitwallet/stakingPools
   * @summary Get all staking pools
   * @tags Kitwallet
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/stakingPools', kitwallet.pools);

  /**
   * GET /v1/kitwallet/staking-deposits/{account}
   * @summary Get staking deposits for an account
   * @tags Kitwallet
   * @param {string} account.path.required - account id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/staking-deposits/:account',
    validator(schema.deposits),
    kitwallet.deposits,
  );

  /**
   * GET /v1/kitwallet/publicKey/{key}/accounts
   * @summary Get accounts by public key
   * @tags Kitwallet
   * @param {string} key.path.required - public key
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/publicKey/:key/accounts',
    validator(schema.accounts),
    kitwallet.accounts,
  );

  /**
   * GET /v1/kitwallet/account/{account}/activities
   * @summary Get activities for an account
   * @tags Kitwallet
   * @param {string} account.path.required - account id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/account/:account/activities',
    validator(schema.activities),
    kitwallet.activities,
  );

  /**
   * GET /v1/kitwallet/account/{account}/callReceivers
   * @summary Get call receivers for an account
   * @tags Kitwallet
   * @param {string} account.path.required - account id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/account/:account/callReceivers',
    validator(schema.receivers),
    kitwallet.receivers,
  );

  /**
   * GET /v1/kitwallet/account/{account}/likelyTokens
   * @summary Get likely tokens for an account
   * @tags Kitwallet
   * @param {string} account.path.required - account id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/account/:account/likelyTokens',
    validator(schema.tokens),
    kitwallet.tokens,
  );

  /**
   * GET /v1/kitwallet/account/{account}/likelyTokensFromBlock
   * @summary Get likely tokens for an account from block
   * @tags Kitwallet
   * @param {string} account.path.required - account id
   * @param {string} fromBlockTimestamp.query - block timestamp
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/account/:account/likelyTokensFromBlock',
    validator(schema.tokensFromBlock),
    kitwallet.tokensFromBlock,
  );

  /**
   * GET /v1/kitwallet/account/{account}/likelyNFTs
   * @summary Get likely nfts for an account
   * @tags Kitwallet
   * @param {string} account.path.required - account id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/account/:account/likelyNFTs',
    validator(schema.nfts),
    kitwallet.nfts,
  );

  /**
   * GET /v1/kitwallet/account/{account}/likelyNFTsFromBlock
   * @summary Get likely nfts for an account from block
   * @tags Kitwallet
   * @param {string} account.path.required - account id
   * @param {string} fromBlockTimestamp.query - block timestamp
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/account/:account/likelyNFTsFromBlock',
    validator(schema.nftsFromBlock),
    kitwallet.nftsFromBlock,
  );

  /**
   * GET /v1/kitwallet/account/{account}/receipts
   * @summary Get account receipts
   * @tags Kitwallet
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
  route.get(
    '/account/:account/receipts',
    validator(accountSchema.receipts),
    account.receipts,
  );

  /**
   * GET /v1/kitwallet/account/{account}/receipts/count
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
    '/account/:account/receipts/count',
    validator(accountSchema.receiptsCount),
    account.receiptsCount,
  );
};

export default routes;
