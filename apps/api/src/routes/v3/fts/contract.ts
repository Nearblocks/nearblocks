import { Router } from 'express';

import request from 'nb-schemas/dist/fts/request.js';
import statsRequest from 'nb-schemas/dist/fts/stats/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/fts/contract';
import statsService from '#services/v3/fts/stats';

const route = Router();

const routes = (app: Router) => {
  app.use('/fts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/fts/{contract}:
   *   get:
   *     summary: Get FT contract details
   *     tags:
   *       - FTs
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
  route.get('/:contract', validate(request.contract), service.contract);

  /**
   * @openapi
   * /v3/fts/{contract}/txns:
   *   get:
   *     summary: List FT contract transfers
   *     tags:
   *       - FTs
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
   * /v3/fts/{contract}/txns/count:
   *   get:
   *     summary: Get FT contract transfer count
   *     tags:
   *       - FTs
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
   * /v3/fts/{contract}/holders:
   *   get:
   *     summary: List FT contract holders
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
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
  route.get(
    '/:contract/holders',
    validate(request.contractHolders),
    service.holders,
  );

  /**
   * @openapi
   * /v3/fts/{contract}/holders/count:
   *   get:
   *     summary: Get FT contract holder count
   *     tags:
   *       - FTs
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
    '/:contract/holders/count',
    validate(request.contractHolderCount),
    service.holderCount,
  );

  /**
   * @openapi
   * /v3/fts/{contract}/stats/overview:
   *   get:
   *     summary: Get FT contract stats overview
   *     tags:
   *       - FTs
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
    '/:contract/stats/overview',
    validate(statsRequest.overview),
    statsService.overview,
  );

  /**
   * @openapi
   * /v3/fts/{contract}/stats/heatmap:
   *   get:
   *     summary: Get FT contract transfer heatmap (last 11 months, daily)
   *     tags:
   *       - FTs
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
    '/:contract/stats/heatmap',
    validate(statsRequest.heatmap),
    statsService.heatmap,
  );

  /**
   * @openapi
   * /v3/fts/{contract}/stats/transfers:
   *   get:
   *     summary: Get FT contract daily transfer stats
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of days to return (max 365)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/stats/transfers',
    validate(statsRequest.transfers),
    statsService.transfers,
  );

  /**
   * @openapi
   * /v3/fts/{contract}/stats/{account}/transfers:
   *   get:
   *     summary: Get daily FT transfer stats for a specific account on a contract
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of days to return (max 365)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/stats/:account/transfers',
    validate(statsRequest.accountTransfers),
    statsService.accountTransfers,
  );
};

export default routes;
