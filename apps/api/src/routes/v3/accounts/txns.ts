import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/txns/request.js';

import internalOnly from '#middlewares/internalOnly';
import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/txns';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/txns:
   *   get:
   *     summary: List account transactions
   *     description: >-
   *       Lists transactions the account signed or received, newest first. With
   *       only one of `signer`/`receiver` set, the other side is the account
   *       itself; if both are set, one must be the account or the result is
   *       empty. Fees and deposits are in yoctoNEAR. Paginate with
   *       `next`/`prev` using `meta.next_page`/`meta.prev_page`.
   *     tags:
   *       - Account Transactions
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: signer
   *         description: Signer account ID to filter by
   *         schema:
   *           type: string
   *       - in: query
   *         name: receiver
   *         description: Receiver account ID to filter by
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_ts
   *         description: Only return results before this 19-digit nanosecond Unix timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
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
   *         $ref: '#/components/responses/accounts.txns.txns'
   */
  route.get('/:account/txns', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/accounts/{account}/txns/count:
   *   get:
   *     summary: Get estimated account transaction count
   *     x-internal: true
   *     tags:
   *       - Account Transactions
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: signer
   *         description: Signer account ID to filter by
   *         schema:
   *           type: string
   *       - in: query
   *         name: receiver
   *         description: Receiver account ID to filter by
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_ts
   *         description: Only return results before this 19-digit nanosecond Unix timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.txns.count'
   */
  route.get(
    '/:account/txns/count',
    internalOnly,
    validate(request.count),
    service.count,
  );

  route.get(
    '/:account/txns/export',
    internalOnly,
    validate(request.export),
    service.exports,
  );
};

export default routes;
