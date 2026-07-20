import { Router } from 'express';

import config from '#config';
import schema from '#libs/schema/analytics';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import account from '#services/analytics/account';
import analyticsProxy from '#services/proxy/analytics';

const route = Router();

const service = config.v1ProxyEnabled ? analyticsProxy : account;

const routes = (app: Router) => {
  app.use('/analytics', bearerAuth, rateLimiter, route);

  route.get('/:account/balance', validator(schema.balance), service.balance);
};

export default routes;
