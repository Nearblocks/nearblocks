import { Router } from 'express';

import { schema } from '#libs/schema/v2/mt';
import { bearerAuth } from '#middlewares/passport';
import validator from '#middlewares/validator';
import mt from '#services/v2/mt/index';
const route = Router();

const routes = (app: Router) => {
  app.use('/mt', bearerAuth, route);

  route.get('/list', validator(schema.inventory), mt.mtInventory);

  route.get('/meta', validator(schema.meta), mt.metaData);
};

export default routes;
