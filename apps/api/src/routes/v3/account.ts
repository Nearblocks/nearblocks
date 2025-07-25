import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import accounts from '#services/v3/accounts/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/account', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/account/{account}:
   *   get:
   *     summary: Get account info
   *     tags:
   *       - V3 / Account
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *         examples:
   *           account:
   *             value: near
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account', validate(request.account), accounts.account);
};

export default routes;
