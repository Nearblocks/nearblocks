import { Router } from 'express';

import schema from '#libs/schema/v2/mts';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import mts from '#services/v2/mts/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/mts', bearerAuth, rateLimiter, route);

  route.get(
    '/contract/:contract/:token_id',
    validator(schema.meta),
    mts.metadata,
  );
};

export default routes;
