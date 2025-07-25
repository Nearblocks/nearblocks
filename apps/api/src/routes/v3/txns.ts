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
   *         examples:
   *           block:
   *             value: 'kjih...dcba'
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
   *         name: cursor
   *         description: Page cursor. Pass the value returned from the previous request to retrieve the next page of results
   *         schema:
   *           type: string
   *         examples:
   *           cursor:
   *             value: 'eyJ0...In0='
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
   *         description: Txn hash to retrieve
   *         schema:
   *           type: string
   *         examples:
   *           hash:
   *             value: 'kjih...dcba'
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:hash', validate(request.txn), service.txn);

  /**
   * @openapi
   * /v3/txns/{hash}/receipts:
   *   get:
   *     summary: Get all txn receipts
   *     tags:
   *       - V3 / Txns
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Txn hash to retrieve receipts for
   *         schema:
   *           type: string
   *         examples:
   *           hash:
   *             value: 'kjih...dcba'
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:hash/receipts', validate(request.receipts), service.receipts);
};

export default routes;
