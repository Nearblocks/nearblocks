import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/keys/request.js';

import internalOnly from '#middlewares/internalOnly';
import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/keys';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/keys:
   *   get:
   *     summary: List account access keys
   *     description: >-
   *       Lists access keys of the account, including deleted ones, ordered by
   *       the latest key action (creation or deletion) first. Each key includes
   *       its permission, the creating and deleting transactions, and MPC
   *       derivation info when the key is a derived key. Paginate with
   *       `next`/`prev` using `meta.next_page`/`meta.prev_page`.
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
   *         $ref: '#/components/responses/accounts.keys.keys'
   */
  route.get('/:account/keys', validate(request.keys), service.keys);

  /**
   * @openapi
   * /v3/accounts/{account}/keys/count:
   *   get:
   *     summary: Get account access key count
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
   *         $ref: '#/components/responses/accounts.keys.count'
   */
  route.get(
    '/:account/keys/count',
    internalOnly,
    validate(request.count),
    service.count,
  );

  route.get(
    '/:account/keys/export',
    internalOnly,
    validate(request.export),
    service.exports,
  );
};

export default routes;
