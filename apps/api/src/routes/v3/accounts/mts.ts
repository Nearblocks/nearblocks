import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/mts/request.js';

import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/mts';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/mt-txns:
   *   get:
   *     summary: Get account mt txns
   *     tags:
   *       - V3 / Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: contract
   *         description: Contract ID to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: token
   *         description: Token ID to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: involved
   *         description: Involved account to filter results by
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
   *         description: Success response
   */
  route.get('/:account/mt-txns', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/accounts/{account}/mt-txns/count:
   *   get:
   *     summary: Get estimated account mt txns count
   *     tags:
   *       - V3 / Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: contract
   *         description: Contract ID to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: token
   *         description: Token ID to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: involved
   *         description: Involved account to filter results by
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
   *         description: Success response
   */
  route.get('/:account/mt-txns/count', validate(request.count), service.count);
};

export default routes;
