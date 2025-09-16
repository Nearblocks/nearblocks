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
   *     summary: Get access keys
   *     tags:
   *       - V3 / Keys
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         description: Public key
   *         schema:
   *           type: string
   *       - in: query
   *         name: cursor
   *         description: Page cursor. Pass the value returned from the previous request to retrieve the next page of results
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:key', validate(request.keys), service.keys);
};

export default routes;
