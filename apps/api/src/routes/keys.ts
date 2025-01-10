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
   * @openapi
   * /v1/keys/{key}:
   *   get:
   *     summary: Get access key info by public key
   *     tags:
   *       - Access Keys
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         description: Public key
   *         schema:
   *           type: string
   *         examples:
   *           key:
   *             value: example-public-key
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:key', validator(schema.item), keys.item);
};

export default routes;
