import { Router } from 'express';

import schema from '#libs/schema/kitwallet';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import kitwallet from '#services/kitwallet';

const route = Router();

const routes = (app: Router) => {
  app.use('/kitwallet', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/kitwallet/{account}/likely-tokens
   * @summary Get likely tokens for an account
   * @tags Kitwallet
   * @param {string} account.path.required - account id
   * @return 200 - success response
   */
  route.get(
    '/:account/likely-tokens',
    validator(schema.tokens),
    kitwallet.tokens,
  );

  /**
   * GET /v1/kitwallet/{account}/likely-tokens-from-block
   * @summary Get likely tokens for an account from block
   * @tags Kitwallet
   * @param {string} account.path.required - account id
   * @param {string} fromBlockTimestamp.query - block timestamp
   * @return 200 - success response
   */
  route.get(
    '/:account/likely-tokens-from-block',
    validator(schema.tokensFromBlock),
    kitwallet.tokensFromBlock,
  );
};

export default routes;
