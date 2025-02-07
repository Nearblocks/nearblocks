import { Router } from 'express';

import schema from '#libs/schema/accounts';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import eth from '#services/accounts/eth';

const route = Router();

const routes = (app: Router) => {
  app.use('/accounts', bearerAuth, rateLimiter, route);

  route.get('/eth', validator(schema.ethList), eth.list);
};

export default routes;
