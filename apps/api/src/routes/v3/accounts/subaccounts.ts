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
   *     summary: List account subaccounts
   *     description: >-
   *       Lists direct subaccounts of the account (e.g. `bob.alice.near` for
   *       `alice.near`), including deleted ones, ordered by the latest creation
   *       or deletion first. Top-level accounts are not supported. Paginate
   *       with `next`/`prev` using `meta.next_page`/`meta.prev_page`.
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: next
   *         description: Cursor for the next page, taken from `meta.next_page` of the previous response
   *         schema:
   *           type: string
   *       - in: query
   *         name: prev
   *         description: Cursor for the previous page, taken from `meta.prev_page` of the previous response
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
   *         $ref: '#/components/responses/accounts.subaccounts.subaccounts'
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
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.subaccounts.count'
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
