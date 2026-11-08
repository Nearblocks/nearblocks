import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import service from '#services/v3/nodes/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/nodes', bearerAuth, rateLimiter, route);

  // Hidden: not in the API docs; used by the explorer's nodes map.
  route.get('/', service.list);
};

export default routes;
