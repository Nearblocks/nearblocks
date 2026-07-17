import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/subaccounts/request.js';

import internalOnly from '#middlewares/internalOnly';
import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/subaccounts';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/subaccounts:
   *   get:
   *     summary: List account sub accounts
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
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
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:account/subaccounts',
    validate(request.subaccounts),
    service.subaccounts,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/subaccounts/count:
   *   get:
   *     summary: Get account sub account count
   *     x-internal: true
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:account/subaccounts/count',
    internalOnly,
    validate(request.count),
    service.count,
  );

  route.get(
    '/:account/subaccounts/export',
    internalOnly,
    validate(request.export),
    service.exports,
  );
};

export default routes;
