import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/request.js';

import { validate } from '#middlewares/validate';
import accounts from '#services/v3/accounts/index';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}:
   *   get:
   *     summary: Get account info
   *     tags:
   *       - V3 / Accounts
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
  route.get('/:account', validate(request.account), accounts.account);
};

export default routes;
