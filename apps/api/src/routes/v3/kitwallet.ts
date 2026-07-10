import { Router } from 'express';

import request from 'nb-schemas/dist/kitwallet/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/kitwallet/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/kitwallet', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/kitwallet/stakingPools:
   *   get:
   *     summary: Get all staking pools
   *     tags:
   *       - Kitwallet
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/stakingPools', service.pools);

  /**
   * @openapi
   * /v3/kitwallet/staking-deposits/{account}:
   *   get:
   *     summary: Get staking deposits for an account
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *         examples:
   *           account:
   *             value: example-account-id
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/staking-deposits/:account',
    validate(request.deposits),
    service.deposits,
  );

  /**
   * @openapi
   * /v3/kitwallet/publicKey/{key}/accounts:
   *   get:
   *     summary: Get accounts by public key
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         description: Public key
   *         schema:
   *           type: string
   *         examples:
   *           key:
   *             value: example-public-key
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/publicKey/:key/accounts',
    validate(request.accounts),
    service.accounts,
  );

  /**
   * @openapi
   * /v3/kitwallet/account/{account}/likelyTokens:
   *   get:
   *     summary: Get likely tokens for an account
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *         examples:
   *           account:
   *             value: example-account-id
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/account/:account/likelyTokens',
    validate(request.tokens),
    service.tokens,
  );

  /**
   * @openapi
   * /v3/kitwallet/account/{account}/likelyTokensFromBlock:
   *   get:
   *     summary: Get likely tokens for an account from block
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *         examples:
   *           account:
   *             value: example-account-id
   *       - in: query
   *         name: fromBlockTimestamp
   *         description: Block timestamp in nanoseconds
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/account/:account/likelyTokensFromBlock',
    validate(request.tokensFromBlock),
    service.tokensFromBlock,
  );

  /**
   * @openapi
   * /v3/kitwallet/account/{account}/likelyNFTs:
   *   get:
   *     summary: Get likely NFTs for an account
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *         examples:
   *           account:
   *             value: example-account-id
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/account/:account/likelyNFTs',
    validate(request.tokens),
    service.nfts,
  );

  /**
   * @openapi
   * /v3/kitwallet/account/{account}/likelyNFTsFromBlock:
   *   get:
   *     summary: Get likely NFTs for an account from block
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *         examples:
   *           account:
   *             value: example-account-id
   *       - in: query
   *         name: fromBlockTimestamp
   *         description: Block timestamp in nanoseconds
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/account/:account/likelyNFTsFromBlock',
    validate(request.tokensFromBlock),
    service.nftsFromBlock,
  );
};

export default routes;
