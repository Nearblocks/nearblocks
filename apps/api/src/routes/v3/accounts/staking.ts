import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/staking/request.js';

import internalOnly from '#middlewares/internalOnly';
import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/staking';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/staking-txns:
   *   get:
   *     summary: List account staking transactions
   *     description: >-
   *       Lists staking pool events (deposit, stake, unstake, withdraw, reward)
   *       for the account as a delegator, newest first. `amount` is in
   *       yoctoNEAR and `contract` is the staking pool. Paginate with
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
   *         description: Staking pool account ID to filter by, e.g. `astro-stakers.poolv1.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: type
   *         description: Event type to filter by (`DEPOSIT`, `STAKE`, `UNSTAKE`, `WITHDRAW`, `REWARD` or `CONTRACT`)
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
   *         $ref: '#/components/responses/accounts.staking.txns'
   */
  route.get('/:account/staking-txns', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/accounts/{account}/staking-txns/count:
   *   get:
   *     summary: Get estimated account staking transaction count
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
   *         description: Staking pool account ID to filter by, e.g. `astro-stakers.poolv1.near`
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
   *         $ref: '#/components/responses/accounts.staking.count'
   */
  route.get(
    '/:account/staking-txns/count',
    internalOnly,
    validate(request.count),
    service.count,
  );

  route.get(
    '/:account/staking-txns/export',
    internalOnly,
    validate(request.export),
    service.exports,
  );
};

export default routes;
