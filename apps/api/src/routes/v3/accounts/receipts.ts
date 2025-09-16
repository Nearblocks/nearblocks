import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/receipts/request.js';

import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/receipts';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/receipts:
   *   get:
   *     summary: Get account receipts
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
   *         name: predecessor
   *         description: Receipt predecessor account to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: receiver
   *         description: Receipt receiver account to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: action
   *         description: Receipt action to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: method
   *         description: Function call method to filter results by
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
   *         name: cursor
   *         description: Page cursor. Pass the value returned from the previous request to retrieve the next page of results
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
  route.get('/:account/receipts', validate(request.receipts), service.receipts);

  /**
   * @openapi
   * /v3/accounts/{account}/receipts/count:
   *   get:
   *     summary: Get estimated account receipts count
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
   *         name: predecessor
   *         description: Receipt predecessor account to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: receiver
   *         description: Receipt receiver account to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: action
   *         description: Receipt action to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: method
   *         description: Function call method to filter results by
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
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/receipts/count', validate(request.count), service.count);
};

export default routes;
