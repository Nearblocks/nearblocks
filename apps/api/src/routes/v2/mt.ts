import { Router } from 'express';

import { schema } from '#libs/schema/v2/mt';
import { bearerAuth } from '#middlewares/passport';
import validator from '#middlewares/validator';
import mt from '#services/v2/mt/index';
const route = Router();

const routes = (app: Router) => {
  app.use('/mt', bearerAuth, route);

  route.get('/balance', validator(schema.inventory), mt.MT);

  route.get('/meta', validator(schema.meta), mt.metadata);
};

export default routes;
