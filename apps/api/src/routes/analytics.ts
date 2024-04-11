import { Router } from 'express';

import schema from '#libs/schema/analytics';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import account from '#services/analytics/account';

const route = Router();

const routes = (app: Router) => {
  app.use('/analytics', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/analytics/{account}/balance
   * @summary Get historical account balance
   * @tags Analytics
   * @param {string} account.path.required - account id
   * @return 200 - success response
   */
  route.get('/:account/balance', validator(schema.balance), account.balance);
};

export default routes;
