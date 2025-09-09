import { Router } from 'express';

import request from 'nb-schemas/dist/fts/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/fts/contract';

const route = Router();

const routes = (app: Router) => {
  app.use('/fts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/fts/:contract/txns:
   *   get:
   *     summary: Get token transfers
   *     tags:
   *       - V3 / FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: cursor
   *         description: Page cursor. Pass the value returned from the previous request to retrieve the next page of results
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
   *         description: Success response
   */
  route.get('/:contract/txns', validate(request.contractTxns), service.txns);

  /**
   * @openapi
   * /v3/fts/:contract/txns/count:
   *   get:
   *     summary: Get token transfers count
   *     tags:
   *       - V3 / FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/txns/count',
    validate(request.contractTxnCount),
    service.count,
  );
};

export default routes;
