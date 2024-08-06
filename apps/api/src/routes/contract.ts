import { Router } from 'express';

import upload from '#libs/fileUpload';
import schema from '#libs/schema/contract';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import contract from '#services/contract';

const route = Router();

const routes = (app: Router) => {
  app.use('/contract', bearerAuth, rateLimiter, route);

  /**
   * POST /v1/contract/verify
   * @summary Verify contract
   * @tags Contract
   * @return 200 - success response
   */
  route.post('/verify', upload, validator(schema.verify), contract.verify);

  /**
   * GET /v1/contract/{verificationId}/status
   * @summary Get contract verification status
   * @tags Contract
   * @return 200 - success response
   */
  route.get(
    '/:verificationId/status',
    validator(schema.status),
    contract.status,
  );
};

export default routes;
