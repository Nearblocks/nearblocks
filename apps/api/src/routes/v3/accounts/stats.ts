import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/stats/request.js';

import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/stats';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/stats:
   *   get:
   *     summary: Get account stats overview
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
  route.get('/:account/stats', validate(request.overview), service.overview);
  /**
   * @openapi
   * /v3/accounts/{account}/stats/heatmap:
   *   get:
   *     summary: Get account txns heatmap
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
  route.get(
    '/:account/stats/heatmap',
    validate(request.heatmap),
    service.heatmap,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/stats/txns:
   *   get:
   *     summary: Get account txn stats
   *     tags:
   *       - V3 / Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/stats/txns', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/accounts/{account}/stats/balance:
   *   get:
   *     summary: Get account balance stats
   *     tags:
   *       - V3 / Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:account/stats/balance',
    validate(request.balance),
    service.balance,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/stats/near:
   *   get:
   *     summary: Get account near stats
   *     tags:
   *       - V3 / Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/stats/near', validate(request.near), service.near);

  /**
   * @openapi
   * /v3/accounts/{account}/stats/fts:
   *   get:
   *     summary: Get account ft stats
   *     tags:
   *       - V3 / Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/stats/fts', validate(request.fts), service.fts);
};

export default routes;
