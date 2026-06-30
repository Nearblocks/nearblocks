import { Router } from 'express';

import request from 'nb-schemas/dist/stats/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/stats/index';

const routes = (app: Router) => {
  /**
   * @openapi
   * /v3/stats:
   *   get:
   *     summary: Get network stats
   *     tags:
   *       - Stats
   *     responses:
   *       200:
   *         description: Success response
   */
  app.get('/stats', bearerAuth, rateLimiter, service.stats);

  /**
   * @openapi
   * /v3/block-stats:
   *   get:
   *     summary: Get daily block stats
   *     tags:
   *       - Stats
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *       - in: query
   *         name: date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  app.get(
    '/block-stats',
    bearerAuth,
    rateLimiter,
    validate(request.block),
    service.block,
  );

  /**
   * @openapi
   * /v3/txn-stats:
   *   get:
   *     summary: Get daily transaction stats
   *     tags:
   *       - Stats
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *       - in: query
   *         name: date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  app.get(
    '/txn-stats',
    bearerAuth,
    rateLimiter,
    validate(request.txn),
    service.txn,
  );

  /**
   * @openapi
   * /v3/address-stats:
   *   get:
   *     summary: Get daily address stats
   *     tags:
   *       - Stats
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *       - in: query
   *         name: date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  app.get(
    '/address-stats',
    bearerAuth,
    rateLimiter,
    validate(request.address),
    service.address,
  );

  /**
   * @openapi
   * /v3/price-stats:
   *   get:
   *     summary: Get daily NEAR price and market-cap stats
   *     tags:
   *       - Stats
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *       - in: query
   *         name: date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  app.get(
    '/price-stats',
    bearerAuth,
    rateLimiter,
    validate(request.price),
    service.price,
  );

  /**
   * @openapi
   * /v3/signer-stats:
   *   get:
   *     summary: Get daily signer stats
   *     tags:
   *       - Stats
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *       - in: query
   *         name: date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  app.get(
    '/signer-stats',
    bearerAuth,
    rateLimiter,
    validate(request.signer),
    service.signer,
  );

  /**
   * @openapi
   * /v3/tps-stats:
   *   get:
   *     summary: Get transactions-per-second stats
   *     tags:
   *       - Stats
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: The number of items to return (max 60).
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Success response
   */
  app.get(
    '/tps-stats',
    bearerAuth,
    rateLimiter,
    validate(request.tps),
    service.tps,
  );
};

export default routes;
