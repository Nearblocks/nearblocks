import { Router } from 'express';

import schema from '#libs/schema/nodevalidator';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import nodevalidator from '#services/nodevalidator';

const route = Router();

const routes = (app: Router) => {
  app.use('/validators', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/validators
   * @summary Get validators
   * @tags Validators
   * @return 200 - success response
   */
  route.get('/', validator(schema.list), nodevalidator.list);
};

export default routes;
