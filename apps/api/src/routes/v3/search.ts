import { Router } from 'express';

import request from 'nb-schemas/dist/search/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/search/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/search', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/search:
   *   get:
   *     summary: Search by keyword
   *     tags:
   *       - V3 / Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         description: Keyword to search
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', validate(request.search), service.search);

  /**
   * @openapi
   * /v3/search/account:
   *   get:
   *     summary: Search accounts
   *     tags:
   *       - V3 / Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         description: Keyword to search
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/accounts', validate(request.search), service.accounts);

  /**
   * @openapi
   * /v3/search/account:
   *   get:
   *     summary: Search blocks
   *     tags:
   *       - V3 / Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         description: Keyword to search
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/blocks', validate(request.search), service.blocks);
};

export default routes;
