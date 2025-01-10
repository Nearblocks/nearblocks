import { Router } from 'express';

import schema from '#libs/schema/fts';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import contract from '#services/fts/contract';
import ft from '#services/fts/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/fts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v1/fts:
   *   get:
   *     summary: Get top tokens by pagination
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: query
   *         name: search.query
   *         description: Search keyword
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 100
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 50
   *           default: 50
   *       - in: query
   *         name: order
   *         description: Sort order
   *         schema:
   *           type: string
   *           enum: [desc, asc]
   *           default: desc
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', validator(schema.list), ft.list);

  /**
   * @openapi
   * /v1/fts/count:
   *   get:
   *     summary: Get top tokens count
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: query
   *         name: search.query
   *         description: Search keyword
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/count', validator(schema.count), ft.count);

  /**
   * @openapi
   * /v1/fts/txns:
   *   get:
   *     summary: Get token txns by pagination
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: query
   *         name: cursor
   *         description: Next page cursor. Takes precedence over 'page' if provided.
   *         schema:
   *           type: string
   *           minLength: 36
   *           maxLength: 36
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit.
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/txns', validator(schema.txns), ft.txns);

  /**
   * @openapi
   * /v1/fts/txns/count:
   *   get:
   *     summary: Get estimated token txns count
   *     tags:
   *       - FTs
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/txns/count', validator(schema.txnsCount), ft.txnsCount);

  /**
   * @openapi
   * /v1/fts/{contract}:
   *   get:
   *     summary: Get token info
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:contract', validator(schema.item), contract.item);

  /**
   * @openapi
   * /v1/fts/{contract}/txns:
   *   get:
   *     summary: Get token txns by pagination
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *       - in: query
   *         name: account
   *         description: Affected account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: cursor
   *         description: Next page cursor. Takes precedence over 'page' if provided.
   *         schema:
   *           type: string
   *           minLength: 36
   *           maxLength: 36
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit.
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:contract/txns', validator(schema.ftTxns), contract.txns);

  /**
   * @openapi
   * /v1/fts/{contract}/txns/count:
   *   get:
   *     summary: Get estimated token txns count
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *       - in: query
   *         name: account
   *         description: Affected account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/txns/count',
    validator(schema.ftTxnsCount),
    contract.txnsCount,
  );

  /**
   * @openapi
   * /v1/fts/{contract}/holders:
   *   get:
   *     summary: Get token holders by pagination
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit.
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:contract/holders', validator(schema.holders), contract.holders);

  /**
   * @openapi
   * /v1/fts/{contract}/holders/count:
   *   get:
   *     summary: Get estimated token holders count
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/holders/count',
    validator(schema.holdersCount),
    contract.holdersCount,
  );
};

export default routes;
