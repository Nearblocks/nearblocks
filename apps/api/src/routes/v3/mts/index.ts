import { Router } from 'express';

import request from 'nb-schemas/dist/mts/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import token from '#routes/v3/mts/token';
import service from '#services/v3/mts/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/mts', bearerAuth, rateLimiter, route);

  token(app);

  /**
   * @openapi
   * /v3/mts:
   *   get:
   *     summary: List top multi-tokens (FT)
   *     description: >-
   *       Returns fungible NEP-245 multi-tokens (for example intents.near tokens
   *       such as nep141:wrap.near) with metadata, price, on-chain market cap, 24h
   *       volume, holder and transfer counts. Sorted by 24h volume descending by
   *       default; use sort and order to change it. Paginate with the next/prev
   *       cursors from meta.next_page and meta.prev_page.
   *     tags:
   *       - MTs
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
   *           enum: [holders, name, onchain_market_cap, price, transfers, volume_24h]
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
   *         $ref: '#/components/responses/mts.list'
   */
  route.get('/', validate(request.list), service.list);

  /**
   * @openapi
   * /v3/mts/count:
   *   get:
   *     summary: Get multi-token (FT) count
   *     x-internal: true
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: query
   *         name: search
   *         description: Search keyword
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/mts.listCount'
   */
  route.get(
    '/count',
    internalOnly,
    validate(request.listCount),
    service.listCount,
  );

  /**
   * @openapi
   * /v3/mts/txns:
   *   get:
   *     summary: List all MT transfers
   *     description: >-
   *       Returns the latest NEP-245 multi-token transfers across all contracts,
   *       newest first. Each item is one transfer (the receiving side, plus
   *       burns); delta_amount is a raw integer string, apply the token's
   *       decimals. Paginate with the next/prev cursors from meta.next_page and
   *       meta.prev_page.
   *     tags:
   *       - MTs
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
   *         $ref: '#/components/responses/mts.txns'
   */
  route.get('/txns', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/mts/txns/count:
   *   get:
   *     summary: Get MT transfer count
   *     x-internal: true
   *     tags:
   *       - MTs
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
   *         $ref: '#/components/responses/mts.count'
   */
  route.get(
    '/txns/count',
    internalOnly,
    validate(request.count),
    service.count,
  );
};

export default routes;
