import { Router } from 'express';

import request from 'nb-schemas/dist/fts/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import contract from '#routes/v3/fts/contract';
import service from '#services/v3/fts/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/fts', bearerAuth, rateLimiter, route);

  contract(app);

  /**
   * @openapi
   * /v3/fts:
   *   get:
   *     summary: List top fungible tokens
   *     description: >-
   *       Returns NEP-141 fungible tokens with metadata, price, market cap, 24h
   *       volume, holder and transfer counts. Sorted by 24h volume descending by
   *       default; use sort and order to change it. Paginate with the next/prev
   *       cursors from meta.next_page and meta.prev_page.
   *     tags:
   *       - FTs
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
   *           enum: [holders, market_cap, name, onchain_market_cap, price, transfers, volume_24h]
   *           default: volume_24h
   *       - in: query
   *         name: order
   *         description: Sort direction
   *         schema:
   *           type: string
   *           enum: [desc, asc]
   *           default: desc
   *     responses:
   *       200:
   *         $ref: '#/components/responses/fts.list'
   */
  route.get('/', validate(request.list), service.list);

  /**
   * @openapi
   * /v3/fts/count:
   *   get:
   *     summary: Get fungible token count
   *     x-internal: true
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: query
   *         name: search
   *         description: Search keyword
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/fts.count'
   */
  route.get('/count', internalOnly, validate(request.count), service.count);

  /**
   * @openapi
   * /v3/fts/txns:
   *   get:
   *     summary: List all FT transfers
   *     description: >-
   *       Returns the latest NEP-141 token transfers across all contracts, newest
   *       first. Each item is one transfer (the receiving side, plus burns);
   *       delta_amount is a raw integer string, apply the token's decimals.
   *       Timestamps are nanoseconds. Paginate with the next/prev cursors from
   *       meta.next_page and meta.prev_page.
   *     tags:
   *       - FTs
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
   *         $ref: '#/components/responses/fts.txns'
   */
  route.get('/txns', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/fts/txns/count:
   *   get:
   *     summary: Get FT transfer count
   *     x-internal: true
   *     tags:
   *       - FTs
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
   *         $ref: '#/components/responses/fts.txnCount'
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
