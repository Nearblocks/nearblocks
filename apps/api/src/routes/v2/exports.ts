import { Router } from 'express';

import config from '#config';
import schema from '#libs/schema/v2/account';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import exportsProxy from '#services/proxy/exports';
import receipts from '#services/v2/account/receipts';

const route = Router();

const receiptsExport = config.v1ProxyEnabled
  ? exportsProxy.receiptsExportV2
  : receipts.receiptsExport;

const routes = (app: Router) => {
  app.use('/account', bearerAuth, rateLimiter, route);

  route.get(
    '/:account/receipts/export',
    validator(schema.receiptsExport),
    receiptsExport,
  );
};

export default routes;
