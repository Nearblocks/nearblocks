import { Router } from 'express';

import request from 'nb-schemas/dist/txns/request.js';

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
   *     summary: Get all txns
   *     tags:
   *       - V3 / Txns
   *     parameters:
   *       - in: query
   *         name: block
   *         description: Block hash to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: after_ts
   *         description: Timestamp in nanoseconds. Return results after this timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
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
  route.get('/', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/txns/count:
   *   get:
   *     summary: Get estimated txns count
   *     tags:
   *       - V3 / Txns
   *     parameters:
   *       - in: query
   *         name: block
   *         description: Block hash to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: after_ts
   *         description: Timestamp in nanoseconds. Return results after this timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
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
   *         description: Success response
   */
  route.get('/count', validate(request.count), service.count);

  /**
   * @openapi
   * /v3/txns/latest:
   *   get:
   *     summary: Get the latest txns
   *     description: ⚠️ Response is cached for 5 seconds
   *     tags:
   *       - V3 / Txns
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: The number of items to return
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 10
   *           default: 10
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/latest', validate(request.latest), service.latest);

  /**
   * @openapi
   * /v3/txns/{hash}:
   *   get:
   *     summary: Get a txn
   *     tags:
   *       - V3 / Txns
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Txn hash or RLP hash to retrieve
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:hash', validate(request.txn), service.txn);

  /**
   * @openapi
   * /v3/txns/{hash}/receipts:
   *   get:
   *     summary: Get txn receipts
   *     tags:
   *       - V3 / Txns
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Txn hash or RLP hash to retrieve receipts for
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:hash/receipts', validate(request.receipts), service.receipts);

  /**
   * @openapi
   * /v3/txns/{hash}/fts:
   *   get:
   *     summary: Get txn ft events
   *     tags:
   *       - V3 / Txns
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Txn hash or RLP hash to retrieve ft events for
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:hash/fts', validate(request.fts), service.fts);

  /**
   * @openapi
   * /v3/txns/{hash}/nfts:
   *   get:
   *     summary: Get txn nft events
   *     tags:
   *       - V3 / Txns
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Txn hash or RLP hash to retrieve nft events for
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:hash/nfts', validate(request.nfts), service.nfts);
};

export default routes;
