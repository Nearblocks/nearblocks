import { Router } from 'express';

import request from 'nb-schemas/dist/mts/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/mts/contract';

const route = Router({ mergeParams: true });

const routes = (app: Router) => {
  app.use('/mts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/mts/{contract}/txns:
   *   get:
   *     summary: List MT contract transfers
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: affected
   *         description: Affected account to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: token
   *         description: Token ID to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_ts
   *         description: Timestamp in nanoseconds. Return results before this timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
   *       - in: query
   *         name: next
   *         description: Next page cursor. Pass the next_page value returned from the previous response to retrieve the next page of results
   *         schema:
   *           type: string
   *       - in: query
   *         name: prev
   *         description: Previous page cursor. Pass the prev_page value returned from the previous response to retrieve the previous page of results
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
   * /v3/mts/{contract}/txns/count:
   *   get:
   *     summary: Get MT contract transfer count
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: affected
   *         description: Affected account to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: token
   *         description: Token ID to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_ts
   *         description: Timestamp in nanoseconds. Return results before this timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/txns/count',
    validate(request.contractTxnCount),
    service.txnCount,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/holders:
   *   get:
   *     summary: List MT contract holders
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: token
   *         description: Token ID to filter results by
   *         schema:
   *           type: string
   *       - in: query
   *         name: next
   *         description: Next page cursor
   *         schema:
   *           type: string
   *       - in: query
   *         name: prev
   *         description: Previous page cursor
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/holders',
    validate(request.contractHolders),
    service.holders,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/holders/count:
   *   get:
   *     summary: Get MT contract holder count
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: token
   *         description: Token ID to filter results by
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/holders/count',
    validate(request.contractHolderCount),
    service.holderCount,
  );
};

export default routes;
