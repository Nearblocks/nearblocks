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
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @param {number} rpc.query - rpc url to use
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/', validator(schema.list), validators.list);
};

export default routes;
