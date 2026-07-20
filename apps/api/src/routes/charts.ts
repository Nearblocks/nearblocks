import { Router } from 'express';

import config from '#config';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import charts from '#services/charts';
import { deprecated } from '#services/proxy/deprecated';

const route = Router();

// Charts have no faithful v3 source, so they are deprecated when the proxy is on.
const list = config.v1ProxyEnabled ? deprecated : charts.list;
const latest = config.v1ProxyEnabled ? deprecated : charts.latest;
const tps = config.v1ProxyEnabled ? deprecated : charts.tps;

const routes = (app: Router) => {
  app.use('/charts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v1/charts:
   *   get:
   *     summary: Get charts data
   *     tags:
   *       - Legacy / Charts
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', list);

  /**
   * @openapi
   * /v1/charts/latest:
   *   get:
   *     summary: Get latest charts data
   *     tags:
   *       - Legacy / Charts
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/latest', latest);

  /**
   * @openapi
   * /v1/charts/tps:
   *   get:
   *     summary: Get txns per second by shards chart data
   *     tags:
   *       - Legacy / Charts
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/tps', tps);
};

export default routes;
