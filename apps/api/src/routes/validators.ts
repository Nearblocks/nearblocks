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
   * @openapi
   * /v1/validators:
   *   get:
   *     summary: Get validators
   *     tags:
   *       - Validators
   *     parameters:
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit.
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', validator(schema.list), validators.list);
};

export default routes;
