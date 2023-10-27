import { Router } from 'express';

import ft from '#services/account/ft';
import nft from '#services/account/nft';
import txn from '#services/account/txn';
import schema from '#libs/schema/account';
import validator from '#middlewares/validator';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';

const route = Router();

const routes = (app: Router) => {
  app.use('/account', bearerAuth, rateLimiter, route);

  route.get(
    '/:account/txns/export',
    validator(schema.txnsExport),
    txn.txnsExport,
  );

  route.get(
    '/:account/ft-txns/export',
    validator(schema.ftTxnsExport),
    ft.txnsExport,
  );

  route.get(
    '/:account/nft-txns/export',
    validator(schema.nftTxnsExport),
    nft.txnsExport,
  );
};

export default routes;
