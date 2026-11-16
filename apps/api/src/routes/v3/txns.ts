import { Router } from 'express';

import request from 'nb-schemas/dist/txns/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/txns/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/txns', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/txns:
   *   get:
   *     summary: List transactions
   *     description: >-
   *       Returns transactions newest first, optionally limited to one block or
   *       to those before a timestamp. Paginate by passing meta.next_page as next
   *       (or meta.prev_page as prev). Fees are yoctoNEAR strings, gas is in gas
   *       units and timestamps are nanosecond strings.
   *     tags:
   *       - Txns
   *     parameters:
   *       - in: query
   *         name: block
   *         description: Only return transactions included in this block hash
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_ts
   *         description: Timestamp in nanoseconds. Return results before this timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
   *       - in: query
   *         name: next
   *         description: Next page cursor. Pass the next_page value returned from the previous response to retrieve the next page of results
   *         schema:
   *           type: string
   *       - in: query
   *         name: prev
   *         description: Previous page cursor. Pass the prev_page value returned from the previous response to retrieve the previous page of results
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 25
   *     responses:
   *       200:
   *         $ref: '#/components/responses/txns.txns'
   */
  route.get('/', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/txns/count:
   *   get:
   *     summary: Get estimated transaction count
   *     x-internal: true
   *     tags:
   *       - Txns
   *     parameters:
   *       - in: query
   *         name: block
   *         description: Block hash to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_ts
   *         description: Timestamp in nanoseconds. Return results before this timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 25
   *     responses:
   *       200:
   *         $ref: '#/components/responses/txns.count'
   */
  route.get('/count', internalOnly, validate(request.count), service.count);

  /**
   * @openapi
   * /v3/txns/latest:
   *   get:
   *     summary: List latest transactions
   *     description: >-
   *       Returns the most recent transactions, newest first, without
   *       pagination. ⚠️ Response is cached for 5 seconds.
   *     tags:
   *       - Txns
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: Number of transactions to return (1-10)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 10
   *           default: 10
   *     responses:
   *       200:
   *         $ref: '#/components/responses/txns.txns'
   */
  route.get('/latest', validate(request.latest), service.latest);

  /**
   * @openapi
   * /v3/txns/stats:
   *   get:
   *     summary: Get 24-hour transaction statistics
   *     description: >-
   *       Returns totals over the last 24 hours. Transaction count, peak TPS
   *       (busiest minute divided by 60), tokens burnt and average fee per
   *       transaction (yoctoNEAR strings).
   *     tags:
   *       - Txns
   *     responses:
   *       200:
   *         $ref: '#/components/responses/txns.stats'
   */
  route.get('/stats', service.stats);

  /**
   * @openapi
   * /v3/txns/{hash}:
   *   get:
   *     summary: Get transaction by hash
   *     description: >-
   *       Returns a single transaction by base58 transaction hash or 0x-prefixed
   *       RLP hash. data is null if the transaction is not found.
   *     tags:
   *       - Txns
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Base58 transaction hash or 0x-prefixed RLP hash
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/txns.txn'
   */
  route.get('/:hash', validate(request.txn), service.txn);

  /**
   * @openapi
   * /v3/txns/{hash}/receipts:
   *   get:
   *     summary: Get transaction receipt tree
   *     description: >-
   *       Returns the receipt execution tree of a transaction, starting from the
   *       receipt it was converted into, with each receipt's actions, outcome
   *       and child receipts nested. data is null if the transaction is not
   *       found.
   *     tags:
   *       - Txns
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Base58 transaction hash or 0x-prefixed RLP hash
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/txns.receipts'
   */
  route.get('/:hash/receipts', validate(request.receipts), service.receipts);

  /**
   * @openapi
   * /v3/txns/{hash}/fts:
   *   get:
   *     summary: List transaction FT events
   *     description: >-
   *       Returns all fungible token events emitted by the transaction's
   *       receipts, in execution order, with token metadata. delta_amount is in
   *       the token's smallest unit. Returns an empty list if the transaction is
   *       not found.
   *     tags:
   *       - Txns
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Base58 transaction hash or 0x-prefixed RLP hash
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/txns.fts'
   */
  route.get('/:hash/fts', validate(request.fts), service.fts);

  /**
   * @openapi
   * /v3/txns/{hash}/nfts:
   *   get:
   *     summary: List transaction NFT events
   *     description: >-
   *       Returns all NFT events emitted by the transaction's receipts, in
   *       execution order, with token metadata. Returns an empty list if the
   *       transaction is not found.
   *     tags:
   *       - Txns
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Base58 transaction hash or 0x-prefixed RLP hash
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/txns.nfts'
   */
  route.get('/:hash/nfts', validate(request.nfts), service.nfts);

  /**
   * @openapi
   * /v3/txns/{hash}/mts:
   *   get:
   *     summary: List transaction multi-token events
   *     description: >-
   *       Returns all multi-token (NEP-245) events emitted by the transaction's
   *       receipts, in execution order, with token metadata. delta_amount is in
   *       the token's smallest unit. Returns an empty list if the transaction is
   *       not found.
   *     tags:
   *       - Txns
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Base58 transaction hash or 0x-prefixed RLP hash
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/txns.mts'
   */
  route.get('/:hash/mts', validate(request.mts), service.mts);

  route.get(
    '/:hash/detail',
    internalOnly,
    validate(request.detail),
    service.detail,
  );
};

export default routes;
