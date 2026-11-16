import { Router } from 'express';

import request from 'nb-schemas/dist/nfts/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import contract from '#routes/v3/nfts/contract';
import token from '#routes/v3/nfts/token';
import service from '#services/v3/nfts/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/nfts', bearerAuth, rateLimiter, route);

  contract(app);
  token(app);

  /**
   * @openapi
   * /v3/nfts:
   *   get:
   *     summary: List top NFT collections
   *     description: >-
   *       Returns NEP-171 NFT collections with metadata, token count and 24h
   *       transfer count. Sorted by 24h transfers descending by default; use sort
   *       and order to change it. Paginate with the next/prev cursors from
   *       meta.next_page and meta.prev_page.
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: query
   *         name: search
   *         description: Case-insensitive partial match on contract ID, name or symbol
   *         schema:
   *           type: string
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
   *       - in: query
   *         name: sort
   *         description: Field to sort by
   *         schema:
   *           type: string
   *           enum: [name, tokens, transfers_24h]
   *           default: transfers_24h
   *       - in: query
   *         name: order
   *         description: Sort direction
   *         schema:
   *           type: string
   *           enum: [desc, asc]
   *           default: desc
   *     responses:
   *       200:
   *         $ref: '#/components/responses/nfts.list'
   */
  route.get('/', validate(request.list), service.list);

  /**
   * @openapi
   * /v3/nfts/count:
   *   get:
   *     summary: Get NFT collection count
   *     x-internal: true
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: query
   *         name: search
   *         description: Search keyword
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/nfts.count'
   */
  route.get('/count', internalOnly, validate(request.count), service.count);

  /**
   * @openapi
   * /v3/nfts/txns:
   *   get:
   *     summary: List all NFT transfers
   *     description: >-
   *       Returns the latest NEP-171 NFT transfers, mints and burns across all
   *       contracts, newest first. Timestamps are nanoseconds. Paginate with the
   *       next/prev cursors from meta.next_page and meta.prev_page.
   *     tags:
   *       - NFTs
   *     parameters:
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
   *         $ref: '#/components/responses/nfts.txns'
   */
  route.get('/txns', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/nfts/txns/count:
   *   get:
   *     summary: Get NFT transfer count
   *     x-internal: true
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: query
   *         name: before_ts
   *         description: Timestamp in nanoseconds. Return results before this timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
   *     responses:
   *       200:
   *         $ref: '#/components/responses/nfts.txnCount'
   */
  route.get(
    '/txns/count',
    internalOnly,
    validate(request.txnCount),
    service.txnCount,
  );

  return app;
};

export default routes;
