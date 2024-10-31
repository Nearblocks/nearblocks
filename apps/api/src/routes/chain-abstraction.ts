import { Router } from 'express';

import schema from '#libs/schema/chain-abstraction';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import chainAbstraction from '#services/chain-abstraction';

const route = Router();

const routes = (app: Router) => {
  app.use('/chain-abstraction', bearerAuth, rateLimiter, route);

  /**
   * GET /v1/chain-abstraction/{account}/multi-chain-accounts
   * @summary Get multi chain accounts of an account
   * @tags Chain Abstraction
   * @param {string} account.path.required - account id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:account/multi-chain-accounts',
    validator(schema.multiChainAccounts),
    chainAbstraction.multiChainAccounts,
  );
};

export default routes;
