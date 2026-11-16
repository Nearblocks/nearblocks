import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/fts/request.js';

import internalOnly from '#middlewares/internalOnly';
import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/fts';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/ft-txns:
   *   get:
   *     summary: List account FT transfers
   *     description: >-
   *       Lists fungible token events (mints, transfers and burns) that changed
   *       the account balance, newest first, with token metadata.
   *       `delta_amount` is the signed balance change in raw token units (apply
   *       `meta.decimals`); timestamps are nanoseconds. Paginate with
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
   *         name: contract
   *         description: FT contract account ID to filter by, e.g. `wrap.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: involved
   *         description: Counterparty account ID to filter by
   *         schema:
   *           type: string
   *       - in: query
   *         name: cause
   *         description: Event cause to filter by (`MINT`, `TRANSFER` or `BURN`)
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
   *         $ref: '#/components/responses/accounts.fts.txns'
   */
  route.get('/:account/ft-txns', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/accounts/{account}/ft-txns/count:
   *   get:
   *     summary: Get estimated account FT transfer count
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
   *         name: contract
   *         description: FT contract account ID to filter by, e.g. `wrap.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: involved
   *         description: Counterparty account ID to filter by
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
   *         $ref: '#/components/responses/accounts.fts.count'
   */
  route.get(
    '/:account/ft-txns/count',
    internalOnly,
    validate(request.count),
    service.count,
  );

  route.get(
    '/:account/ft-txns/export',
    internalOnly,
    validate(request.export),
    service.exports,
  );
};

export default routes;
