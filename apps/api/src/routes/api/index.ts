import { Router } from 'express';

import schema from '#libs/schema/api/index';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import api from '#services/api/index';

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
