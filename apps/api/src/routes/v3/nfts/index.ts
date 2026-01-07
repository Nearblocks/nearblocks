import { Router } from 'express';

import request from 'nb-schemas/dist/nfts/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import contract from '#routes/v3/nfts/contract';
import service from '#services/v3/nfts/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/nfts', bearerAuth, rateLimiter, route);

  contract(app);

  /**
   * @openapi
   * /v3/nfts:
   *   get:
   *     summary: Get top nfts
   *     tags:
   *       - V3 / NFTs
   *     parameters:
   *       - in: query
   *         name: search
   *         description: Search keyword
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
   *         description: Sort field
   *         schema:
   *           type: string
   *           enum: [holders, name, tokens, transfers_24h]
   *           default: transfers_24h
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
  route.get('/', validate(request.list), service.list);

  /**
   * @openapi
   * /v3/nfts/count:
   *   get:
   *     summary: Get top nfts count
   *     tags:
   *       - V3 / NFTs
   *     parameters:
   *       - in: query
   *         name: search
   *         description: Search keyword
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/count', validate(request.count), service.count);

  /**
   * @openapi
   * /v3/nfts/txns:
   *   get:
   *     summary: Get all nft transfers
   *     tags:
   *       - V3 / NFTs
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
   *         description: Success response
   */
  route.get('/txns', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/nfts/txns/count:
   *   get:
   *     summary: Get nft transfers count
   *     tags:
   *       - V3 / NFTs
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
   *         description: Success response
   */
  route.get('/txns/count', validate(request.txnCount), service.txnCount);

  return app;
};

export default routes;
