import { Router } from 'express';

import schema from '#libs/schema/v2/account';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import receipts from '#services/v2/account/receipts';

const route = Router();

const routes = (app: Router) => {
  app.use('/account', bearerAuth, rateLimiter, route);

  route.get(
    '/:account/receipts/export',
    validator(schema.receiptsExport),
    receipts.receiptsExport,
  );
};

export default routes;
