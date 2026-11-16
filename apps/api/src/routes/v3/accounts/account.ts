import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/request.js';

import { validate } from '#middlewares/validate';
import accounts from '#services/v3/accounts/index';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}:
   *   get:
   *     summary: Get account details
   *     description: >-
   *       Returns when the account was created and deleted (transaction hash
   *       and nanosecond block timestamp; empty objects if unknown) and whether
   *       it is locked, meaning it has no active full-access keys. `data` is
   *       null if the account does not exist.
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
   *         $ref: '#/components/responses/accounts.account'
   */
  route.get('/:account', validate(request.account), accounts.account);

  /**
   * @openapi
   * /v3/accounts/{account}/balance:
   *   get:
   *     summary: Get account balance
   *     description: >-
   *       Returns the liquid (`amount`) and staked (`amount_staked`) balance in
   *       yoctoNEAR and storage usage in bytes. Pass `block` or `date` to get
   *       the balance as of that block or the end of that UTC day instead of
   *       the latest; `date` takes precedence if both are set.
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
   *         name: block
   *         description: Block height to read the historical balance at
   *         schema:
   *           type: string
   *       - in: query
   *         name: date
   *         description: UTC date (YYYY-MM-DD) to read the end-of-day balance for
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.balance'
   */
  route.get('/:account/balance', validate(request.balance), accounts.balance);
};

export default routes;
