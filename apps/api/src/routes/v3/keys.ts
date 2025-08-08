import { Router } from 'express';

import request from 'nb-schemas/dist/keys/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/keys/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/keys', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/keys/{key}:
   *   get:
   *     summary: Get access key info
   *     tags:
   *       - V3 / Keys
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         description: Public key
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:key', validate(request.key), service.key);
};

export default routes;
