import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/mts/request.js';

import internalOnly from '#middlewares/internalOnly';
import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/mts';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/mt-txns:
   *   get:
   *     summary: List account multi-token transfers
   *     description: >-
   *       Lists multi-token (NEP-245) events (mints, transfers and burns) that
   *       changed the account balance, newest first. `delta_amount` is the
   *       signed balance change in raw token units; timestamps are nanoseconds.
   *       Paginate with `next`/`prev` using `meta.next_page`/`meta.prev_page`.
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
   *         description: MT contract account ID to filter by, e.g. `intents.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: token
   *         description: MT token ID to filter by
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
   *         $ref: '#/components/responses/accounts.mts.txns'
   */
  route.get('/:account/mt-txns', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/accounts/{account}/mt-txns/count:
   *   get:
   *     summary: Get estimated account multi-token transfer count
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
   *         description: MT contract account ID to filter by, e.g. `intents.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: token
   *         description: MT token ID to filter by
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
   *         $ref: '#/components/responses/accounts.mts.count'
   */
  route.get(
    '/:account/mt-txns/count',
    internalOnly,
    validate(request.count),
    service.count,
  );

  route.get(
    '/:account/mt-txns/export',
    internalOnly,
    validate(request.export),
    service.exports,
  );
};

export default routes;
