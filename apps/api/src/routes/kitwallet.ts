import { Router } from 'express';

import schema from '#libs/schema/kitwallet';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import kitwallet from '#services/kitwallet';

const route = Router();

const routes = (app: Router) => {
  app.use('/kitwallet', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/kitwallet/stakingPools
   * @summary Get all staking pools
   * @tags Kitwallet
   * @return 200 - success response
   */
  route.get('/stakingPools', kitwallet.pools);

  /**
   * GET /v1/kitwallet/publicKey/{key}/accounts
   * @summary Get accounts by public key
   * @tags Kitwallet
   * @param {string} key.path.required - public key
   * @return 200 - success response
   */
  route.get(
    '/publicKey/:key/accounts',
    validator(schema.accounts),
    kitwallet.accounts,
  );

  /**
   * GET /v1/kitwallet/account/{account}/likelyTokens
   * @summary Get likely tokens for an account
   * @tags Kitwallet
   * @param {string} account.path.required - account id
   * @return 200 - success response
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
   */
  route.get(
    '/account/:account/likelyNFTsFromBlock',
    validator(schema.nftsFromBlock),
    kitwallet.nftsFromBlock,
  );
};

export default routes;
