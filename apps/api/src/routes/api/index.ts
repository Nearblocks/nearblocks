import { Router } from 'express';

import api from '#services/api/index';
import schema from '#libs/schema/api/index';
import validator from '#middlewares/validator';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';

const route = Router();

const routes = (app: Router) => {
  app.use('/api', bearerAuth, rateLimiter, route);

  route.get(
    '/account/:account/txns',
    validator(schema.accountTxns),
    api.accountTxns,
  );
};

export default routes;
