import { Router } from 'express';

import schema from '../../libs/schema/v1/txns';
import validator from '../../middlewares/validator';
import txns from '../../services/v1/txns';

const route = Router();

const routes = (app: Router) => {
  app.use('/txns', route);

  route.get('/:hash/parsed', validator(schema.txn), txns.parsedTxn);
};

export default routes;
