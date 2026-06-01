import { Router } from 'express';

import statsRequest from 'nb-schemas/dist/mts/stats/request.js';
import request from 'nb-schemas/dist/mts/tokens/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import statsService from '#services/v3/mts/stats';
import service from '#services/v3/mts/token';

const route = Router({ mergeParams: true });

const routes = (app: Router) => {
  app.use('/mts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/mts/{contract}/tokens:
   *   get:
   *     summary: List MT tokens in a contract
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
   *           maximum: 25
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:contract/tokens', validate(request.list), service.list);

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/count:
   *   get:
   *     summary: Get MT token count in a contract
   *     tags:
   *       - MTs
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
    '/:contract/tokens/count',
    validate(request.tokenCount),
    service.tokenCount,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}:
   *   get:
   *     summary: Get MT token details
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:contract/tokens/:token', validate(request.token), service.token);

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/txns:
   *   get:
   *     summary: List MT token transfers
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
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
    '/:contract/tokens/:token/txns',
    validate(request.txns),
    service.txns,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/txns/count:
   *   get:
   *     summary: Get MT token transfer count
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
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
    '/:contract/tokens/:token/txns/count',
    validate(request.txnCount),
    service.txnCount,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/holders:
   *   get:
   *     summary: List MT token holders
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
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
    '/:contract/tokens/:token/holders',
    validate(request.tokenHolders),
    service.holders,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/holders/count:
   *   get:
   *     summary: Get MT token holder count
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/tokens/:token/holders/count',
    validate(request.tokenHolderCount),
    service.holderCount,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/stats/overview:
   *   get:
   *     summary: Get MT token stats overview
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/tokens/:token/stats/overview',
    validate(statsRequest.overview),
    statsService.overview,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/stats/heatmap:
   *   get:
   *     summary: Get MT token transfer heatmap (last 11 months, daily)
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/tokens/:token/stats/heatmap',
    validate(statsRequest.heatmap),
    statsService.heatmap,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/stats/transfers:
   *   get:
   *     summary: Get MT token daily transfer stats
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
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
    '/:contract/tokens/:token/stats/transfers',
    validate(statsRequest.transfers),
    statsService.transfers,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/stats/{account}/transfers:
   *   get:
   *     summary: Get daily MT transfer stats for a specific account on a token
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
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
    '/:contract/tokens/:token/stats/:account/transfers',
    validate(statsRequest.accountTransfers),
    statsService.accountTransfers,
  );
};

export default routes;
