import { Router } from 'express';

import schema from '#libs/schema/key';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import key from '#services/key';

const route = Router();

const routes = (app: Router) => {
  app.use('/keys', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/keys/{key}
   * @summary Get access key info by public key
   * @tags Access Keys
   * @param {string} key.path.required - public key
   * @return 200 - success response
   */
  route.get('/:key', validator(schema.item), key.item);
};

export default routes;
