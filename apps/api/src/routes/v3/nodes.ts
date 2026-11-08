import { Router } from 'express';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import service from '#services/v3/nodes/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/nodes', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/nodes:
   *   get:
   *     summary: NEAR nodes that sent telemetry in the last 10 minutes
   *     description: Version, height, peers and approximate location per node, with version and country counts.
   *     tags:
   *       - Nodes
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', service.list);
};

export default routes;
