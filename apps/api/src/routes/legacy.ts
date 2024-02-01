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
   * GET /v1/legacy/total-supply
   * @summary Get total near supply
   * @tags Legacy
   * @param {string} unit.query - json:{"enum": ["yoctonear", "near"], "default": "yoctonear"} - Unit of Near supply. Choosing NEAR will result in a text-only response
   * @return 200 - success response
   */
  route.get('/total-supply', validator(schema.supply), legacy.total);

  /**
   * GET /v1/legacy/circulating-supply
   * @summary Get circulating near supply
   * @tags Legacy
   * @param {string} unit.query - json:{"enum": ["yoctonear", "near"], "default": "yoctonear"} - Unit of Near supply. Choosing NEAR will result in a text-only response
   * @return 200 - success response
   */
  route.get('/circulating-supply', validator(schema.supply), legacy.supply);
};

export default routes;
