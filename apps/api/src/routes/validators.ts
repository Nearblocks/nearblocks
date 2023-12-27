import { Router } from 'express';

import schema from '#libs/schema/blocks';
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

  /**
   * GET /v1/validators/telemetry
   * @summary Get validators telemetry
   * @tags Validators
   * @return 200 - success response
   */
  route.get('/telemetry', validator(schema.list), validators.list);
};

export default routes;
