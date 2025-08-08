import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/keys/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/keys';

const route = Router();

const routes = (app: Router) => {
  app.use('/accounts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/accounts/{account}/keys:
   *   get:
   *     summary: Get account access keys
   *     tags:
   *       - V3 / Account Access Keys
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
   *       - in: query
   *         name: cursor
   *         description: Page cursor. Pass the value returned from the previous request to retrieve the next page of results
   *         schema:
   *           type: string
   *         examples:
   *           cursor:
   *             value: 'eyJ0...In0='
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
  route.get('/:account/keys', validate(request.keys), service.keys);

  /**
   * @openapi
   * /v3/accounts/{account}/keys/count:
   *   get:
   *     summary: Get estimated account keys count
   *     tags:
   *       - V3 / Account Access Keys Count
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
  route.get('/:account/keys/count', validate(request.count), service.count);
};

export default routes;
