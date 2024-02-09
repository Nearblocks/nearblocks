import { Router } from 'express';

import schema from '#libs/schema/validators';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import validators from '#services/validators';

const route = Router();

const routes = (app: Router) => {
  app.use('/validators', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/validators
   * @summary Get validators
   * @tags Validators
   * @return 200 - success response
   */
  route.get('/', validator(schema.list), validators.list);
};

export default routes;
