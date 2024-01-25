import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import legacy from '#services/legacy';

const route = Router();

const routes = (app: Router) => {
  app.use('/legacy', bearerAuth, rateLimiter, route);

  route.get('/supply', legacy.supply);
  route.get('/supply-in-near', legacy.supplyInNear);
};

export default routes;
