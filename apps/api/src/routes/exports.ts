import { Router } from 'express';

import config from '#config';
import schema from '#libs/schema/account';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import ft from '#services/account/ft';
import nft from '#services/account/nft';
import txn from '#services/account/txn';
import exportsProxy from '#services/proxy/exports';

const route = Router();

const proxied = config.v1ProxyEnabled;

const routes = (app: Router) => {
  app.use('/account', bearerAuth, rateLimiter, route);

  route.get(
    '/:account/txns/export',
    validator(schema.txnsExport),
    proxied ? exportsProxy.txnsExport : txn.txnsExport,
  );

  route.get(
    '/:account/txns-only/export',
    validator(schema.txnsOnlyExport),
    proxied ? exportsProxy.txnsOnlyExport : txn.txnsOnlyExport,
  );

  route.get(
    '/:account/receipts/export',
    validator(schema.receiptsExport),
    proxied ? exportsProxy.receiptsExport : txn.receiptsExport,
  );

  route.get(
    '/:account/ft-txns/export',
    validator(schema.ftTxnsExport),
    proxied ? exportsProxy.ftTxnsExport : ft.txnsExport,
  );

  route.get(
    '/:account/nft-txns/export',
    validator(schema.nftTxnsExport),
    proxied ? exportsProxy.nftTxnsExport : nft.txnsExport,
  );
};

export default routes;
