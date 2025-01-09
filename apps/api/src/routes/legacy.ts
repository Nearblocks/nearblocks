import { Router } from 'express';

import schema from '#libs/schema/legacy';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import legacy from '#services/legacy';

const route = Router();

const routes = (app: Router) => {
  app.use('/legacy', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v1/legacy/total-supply:
   *   get:
   *     summary: Get total near supply
   *     tags:
   *       - Legacy
   *     parameters:
   *       - in: query
   *         name: unit
   *         description: Unit of Near supply. Choosing NEAR will result in a text-only response
   *         schema:
   *           type: string
   *           enum: [yoctonear, near]
   *           default: yoctonear
   *       - in: query
   *         name: format
   *         description: If 'coingecko', return value
   *         schema:
   *           type: string
   *           enum: [coingecko]
   *           default: null
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/total-supply', validator(schema.supply), legacy.total);

  /**
   * @openapi
   * /v1/legacy/circulating-supply:
   *   get:
   *     summary: Get circulating near supply
   *     tags:
   *       - Legacy
   *     parameters:
   *       - in: query
   *         name: unit
   *         description: Unit of Near supply. Choosing NEAR will result in a text-only response
   *         schema:
   *           type: string
   *           enum: [yoctonear, near]
   *           default: yoctonear
   *       - in: query
   *         name: format
   *         description: If 'coingecko', returns value
   *         schema:
   *           type: string
   *           enum: [coingecko]
   *           default: null
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/circulating-supply', validator(schema.supply), legacy.supply);

  /**
   * @openapi
   * /v1/legacy/fees:
   *   get:
   *     summary: Get tokens burnt per day
   *     tags:
   *       - Legacy
   *     parameters:
   *       - in: query
   *         name: period
   *         description: Data period
   *         schema:
   *           type: string
   *           enum: [day, week]
   *           default: day
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/fees', validator(schema.fees), legacy.fees);

  route.get('/ping', legacy.ping);

  route.post('/nodes', validator(schema.nodes), legacy.nodes);
};

export default routes;
