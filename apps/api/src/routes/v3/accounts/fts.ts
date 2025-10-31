import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/fts/request.js';

import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/fts';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/fts:
   *   get:
   *     summary: Get account fts
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
   *         name: involved
   *         description: Involved account to filter results by
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
  route.get('/:account/fts', validate(request.fts), service.fts);

  /**
   * @openapi
   * /v3/accounts/{account}/fts/count:
   *   get:
   *     summary: Get estimated account fts count
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
   *         name: involved
   *         description: Involved account to filter results by
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
  route.get('/:account/fts/count', validate(request.count), service.count);
};

export default routes;
