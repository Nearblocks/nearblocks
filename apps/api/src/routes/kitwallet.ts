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
   * @openapi
   * /v1/kitwallet/stakingPools:
   *   get:
   *     summary: Get all staking pools
   *     tags:
   *       - Kitwallet
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/stakingPools', kitwallet.pools);

  /**
   * @openapi
   * /v1/kitwallet/staking-deposits/{account}:
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
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/staking-deposits/:account',
    validator(schema.deposits),
    kitwallet.deposits,
  );

  /**
   * @openapi
   * /v1/kitwallet/publicKey/{key}/accounts:
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
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/publicKey/:key/accounts',
    validator(schema.accounts),
    kitwallet.accounts,
  );

  /**
   * @openapi
   * /v1/kitwallet/account/{account}/activities:
   *   get:
   *     summary: Get activities for an account
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/account/:account/activities',
    validator(schema.activities),
    kitwallet.activities,
  );

  /**
   * @openapi
   * /v1/kitwallet/account/{account}/callReceivers:
   *   get:
   *     summary: Get call receivers for an account
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/account/:account/callReceivers',
    validator(schema.receivers),
    kitwallet.receivers,
  );

  /**
   * @openapi
   * /v1/kitwallet/account/{account}/likelyTokens:
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
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/account/:account/likelyTokens',
    validator(schema.tokens),
    kitwallet.tokens,
  );

  /**
   * @openapi
   * /v1/kitwallet/account/{account}/likelyTokensFromBlock:
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
   *       - in: query
   *         name: fromBlockTimestamp
   *         description: Block timestamp
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/account/:account/likelyTokensFromBlock',
    validator(schema.tokensFromBlock),
    kitwallet.tokensFromBlock,
  );

  /**
   * @openapi
   * /v1/kitwallet/account/{account}/likelyNFTs:
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
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/account/:account/likelyNFTs',
    validator(schema.nfts),
    kitwallet.nfts,
  );

  /**
   * @openapi
   * /v1/kitwallet/account/{account}/likelyNFTsFromBlock:
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
   *       - in: query
   *         name: fromBlockTimestamp
   *         description: Block timestamp
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/account/:account/likelyNFTsFromBlock',
    validator(schema.nftsFromBlock),
    kitwallet.nftsFromBlock,
  );

  /**
   * @openapi
   * /v1/kitwallet/account/{account}/receipts:
   *   get:
   *     summary: Get account receipts
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: from
   *         description: Sender account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: to
   *         description: Receiver account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: action
   *         description: Action kind
   *         schema:
   *           type: string
   *       - in: query
   *         name: method
   *         description: Function call method
   *         schema:
   *           type: string
   *       - in: query
   *         name: after_date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *       - in: query
   *         name: cursor
   *         description: Next page cursor, takes precedence over 'page' if provided
   *         schema:
   *           type: string
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit.
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *       - in: query
   *         name: order
   *         description: Sort order
   *         schema:
   *           type: string
   *           enum: [desc, asc]
   *           default: desc
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/account/:account/receipts',
    validator(accountSchema.receipts),
    account.receipts,
  );

  /**
   * @openapi
   * /v1/kitwallet/account/{account}/receipts/count:
   *   get:
   *     summary: Get estimated account receipts count
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: from
   *         description: Sender account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: to
   *         description: Receiver account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: action
   *         description: Action kind
   *         schema:
   *           type: string
   *       - in: query
   *         name: method
   *         description: Function call method
   *         schema:
   *           type: string
   *       - in: query
   *         name: after_date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/account/:account/receipts/count',
    validator(accountSchema.receiptsCount),
    account.receiptsCount,
  );
};

export default routes;
