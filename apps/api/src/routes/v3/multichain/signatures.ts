import { Router } from 'express';

import request from 'nb-schemas/dist/multichain/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/multichain/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/multichain', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/multichain/mpcs:
   *   get:
   *     summary: List MPC operators
   *     description: >-
   *       Returns the Chain Signatures MPC signer contract, its signing threshold
   *       and participants with their URL, TLS public key, whether they are a
   *       validator and TEE attestation status. ⚠️ Response is cached for 5
   *       minutes.
   *     tags:
   *       - Multichain
   *     responses:
   *       200:
   *         $ref: '#/components/responses/multichain.mpcState'
   */
  route.get('/mpcs', service.mpcs);

  /**
   * @openapi
   * /v3/multichain/signatures:
   *   get:
   *     summary: List multichain signature transactions
   *     description: >-
   *       Returns Chain Signatures sign requests with their NEAR transaction and
   *       destination chain, address and transaction where known, newest first.
   *       Paginate by passing meta.next_page as next (or meta.prev_page as prev).
   *     tags:
   *       - Multichain
   *     parameters:
   *       - in: query
   *         name: account
   *         description: Only return requests whose transaction was signed by this NEAR account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: chain
   *         description: Only return requests for this destination chain
   *         schema:
   *           type: string
   *           enum: [ARBITRUM, BASE, BITCOIN, BSC, ETHEREUM, GNOSIS, OPTIMISM, POLYGON, SOLANA, ZCASH]
   *       - in: query
   *         name: address
   *         description: Only return requests for this destination chain address
   *         schema:
   *           type: string
   *       - in: query
   *         name: txn
   *         description: Only return requests linked to this destination chain transaction hash
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
   *         $ref: '#/components/responses/multichain.txns'
   */
  route.get('/signatures', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/multichain/signatures/count:
   *   get:
   *     summary: Get estimated multichain signature count
   *     x-internal: true
   *     tags:
   *       - Multichain
   *     parameters:
   *       - in: query
   *         name: account
   *         description: Account ID to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: chain
   *         description: Destination chain to filter results by
   *         schema:
   *           type: string
   *           enum: [ARBITRUM, BASE, BITCOIN, BSC, ETHEREUM, GNOSIS, OPTIMISM, POLYGON, SOLANA, ZCASH]
   *       - in: query
   *         name: address
   *         description: Destination address to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: txn
   *         description: Destination transaction hash to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_ts
   *         description: Timestamp in nanoseconds. Return results before this timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
   *     responses:
   *       200:
   *         $ref: '#/components/responses/multichain.count'
   */
  route.get(
    '/signatures/count',
    internalOnly,
    validate(request.count),
    service.count,
  );

  /**
   * @openapi
   * /v3/multichain/signatures/stats:
   *   get:
   *     summary: Get 24-hour multichain signature statistics
   *     description: >-
   *       Returns counts over the last 24 hours. Signature requests, distinct
   *       signer accounts, destination addresses and destination chains.
   *     tags:
   *       - Multichain
   *     responses:
   *       200:
   *         $ref: '#/components/responses/multichain.stats'
   */
  route.get('/signatures/stats', service.stats);
};

export default routes;
