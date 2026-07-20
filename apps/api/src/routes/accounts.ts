import { Router } from 'express';

import config from '#config';
import schema from '#libs/schema/accounts';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import eth from '#services/accounts/eth';
import { deprecated } from '#services/proxy/deprecated';

const route = Router();

const ethList = config.v1ProxyEnabled ? deprecated : eth.list;

const routes = (app: Router) => {
  app.use('/accounts', bearerAuth, rateLimiter, route);

  route.get('/eth', validator(schema.ethList), ethList);
};

export default routes;
