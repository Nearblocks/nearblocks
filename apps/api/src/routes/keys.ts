import { Router } from 'express';

import schema from '#libs/schema/keys';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import keys from '#services/keys';

const route = Router();

const routes = (app: Router) => {
  app.use('/keys', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/keys/{key}
   * @summary Get access key info by public key
   * @tags Access Keys
   * @param {string} key.path.required - public key
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:key', validator(schema.item), keys.item);
};

export default routes;
