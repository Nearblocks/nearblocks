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
   * @openapi
   * /v1/chain-abstraction/{account}/multi-chain-accounts:
   *   get:
   *     summary: Get multi chain accounts of an account
   *     tags:
   *       - Chain Abstraction
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
    '/:account/multi-chain-accounts',
    validator(schema.multiChainAccounts),
    chainAbstraction.multiChainAccounts,
  );

  /**
   * @openapi
   * /v1/chain-abstraction/{account}/txns:
   *   get:
   *     summary: Get multi chain txns of the account by pagination
   *     tags:
   *       - Chain Abstraction
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
   *         name: from
   *         description: Sender account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: after_block
   *         description: Block height after which to get transactions
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_block
   *         description: Block height before which to get transactions
   *         schema:
   *           type: string
   *       - in: query
   *         name: after_date
   *         description: Date in YYYY-MM-DD format to get transactions after this date
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_date
   *         description: Date in YYYY-MM-DD format to get transactions before this date
   *         schema:
   *           type: string
   *       - in: query
   *         name: chain
   *         description: Foreign chain
   *         schema:
   *           type: string
   *       - in: query
   *         name: multichain_address
   *         description: Multi-chain address
   *         schema:
   *           type: string
   *       - in: query
   *         name: cursor
   *         description: Next page cursor, takes precedence over 'page' if provided
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
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
    '/:account/txns',
    validator(schema.accountMultiChainTxns),
    chainAbstraction.multiChainTxns,
  );

  /**
   * @openapi
   * /v1/chain-abstraction/{account}/txns/count:
   *   get:
   *     summary: Get estimated multi chain txns count of the account
   *     tags:
   *       - Chain Abstraction
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
   *         name: from
   *         description: Sender account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: after_block
   *         description: Block height after which to get transactions
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_block
   *         description: Block height before which to get transactions
   *         schema:
   *           type: string
   *       - in: query
   *         name: after_date
   *         description: Date in YYYY-MM-DD format to get transactions after this date
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_date
   *         description: Date in YYYY-MM-DD format to get transactions before this date
   *         schema:
   *           type: string
   *       - in: query
   *         name: chain
   *         description: Foreign chain
   *         schema:
   *           type: string
   *       - in: query
   *         name: multichain_address
   *         description: Multi-chain address
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:account/txns/count',
    validator(schema.accountMultiChainTxnsCount),
    chainAbstraction.multiChainTxnsCount,
  );

  /**
   * @openapi
   * /v1/chain-abstraction/txns:
   *   get:
   *     summary: Get multi chain txns by pagination
   *     tags:
   *       - Chain Abstraction
   *     parameters:
   *       - in: query
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
   *         name: after_block
   *         description: Block height after which to get transactions
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_block
   *         description: Block height before which to get transactions
   *         schema:
   *           type: string
   *       - in: query
   *         name: after_date
   *         description: Date in YYYY-MM-DD format to get transactions after this date
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_date
   *         description: Date in YYYY-MM-DD format to get transactions before this date
   *         schema:
   *           type: string
   *       - in: query
   *         name: chain
   *         description: Foreign chain
   *         schema:
   *           type: string
   *       - in: query
   *         name: multichain_address
   *         description: Multi-chain address
   *         schema:
   *           type: string
   *       - in: query
   *         name: cursor
   *         description: Next page cursor, takes precedence over 'page' if provided
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
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
    '/txns',
    validator(schema.multiChainTxns),
    chainAbstraction.multiChainTxns,
  );

  /**
   * @openapi
   * /v1/chain-abstraction/txns/count:
   *   get:
   *     summary: Get estimated multi chain txns count
   *     tags:
   *       - Chain Abstraction
   *     parameters:
   *       - in: query
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
   *         name: after_block
   *         description: Block height after which to get transaction count
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_block
   *         description: Block height before which to get transaction count
   *         schema:
   *           type: string
   *       - in: query
   *         name: after_date
   *         description: Date in YYYY-MM-DD format to get transaction count after this date
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_date
   *         description: Date in YYYY-MM-DD format to get transaction count before this date
   *         schema:
   *           type: string
   *       - in: query
   *         name: chain
   *         description: Foreign chain
   *         schema:
   *           type: string
   *       - in: query
   *         name: multichain_address
   *         description: Multi-chain address
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/txns/count',
    validator(schema.multiChainTxnsCount),
    chainAbstraction.multiChainTxnsCount,
  );
};

export default routes;
