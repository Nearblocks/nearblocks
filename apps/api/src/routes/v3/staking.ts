import { Router } from 'express';

import request from 'nb-schemas/dist/staking/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/staking/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/staking-txns', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/staking-txns:
   *   get:
   *     summary: List staking transactions
   *     description: >-
   *       Returns staking pool events (deposit, stake, unstake, withdraw, reward,
   *       contract) with their transactions, newest first. Paginate by passing
   *       meta.next_page as next (or meta.prev_page as prev). Amounts are
   *       yoctoNEAR strings.
   *     tags:
   *       - Staking
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
   *         $ref: '#/components/responses/staking.txns'
   */
  route.get('/', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/staking-txns/count:
   *   get:
   *     summary: Get estimated staking transaction count
   *     x-internal: true
   *     tags:
   *       - Staking
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
   *         $ref: '#/components/responses/staking.count'
   */
  route.get('/count', internalOnly, validate(request.count), service.count);
};

export default routes;
