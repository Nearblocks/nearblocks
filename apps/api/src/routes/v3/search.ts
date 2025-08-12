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
   *     summary: Search
   *     tags:
   *       - V3 / Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         description: Txn hash | account id | block hash | block height | receipt id | token contract
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', validate(request.search), service.search);

  /**
   * @openapi
   * /v3/search/accounts:
   *   get:
   *     summary: Search accounts
   *     tags:
   *       - V3 / Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         description: Account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/accounts', validate(request.search), service.accounts);

  /**
   * @openapi
   * /v3/search/blocks:
   *   get:
   *     summary: Search blocks
   *     tags:
   *       - V3 / Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         description: Block hash or height
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/blocks', validate(request.search), service.blocks);

  /**
   * @openapi
   * /v3/search/keys:
   *   get:
   *     summary: Search keys
   *     tags:
   *       - V3 / Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         description: Public key
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/keys', validate(request.search), service.keys);

  /**
   * @openapi
   * /v3/search/fts:
   *   get:
   *     summary: Search fts
   *     tags:
   *       - V3 / Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         description: Token contract
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/fts', validate(request.search), service.fts);

  /**
   * @openapi
   * /v3/search/nfts:
   *   get:
   *     summary: Search nfts
   *     tags:
   *       - V3 / Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         description: Token contract
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/nfts', validate(request.search), service.nfts);

  /**
   * @openapi
   * /v3/search/receipts:
   *   get:
   *     summary: Search receipts
   *     tags:
   *       - V3 / Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         description: Receipt ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/receipts', validate(request.search), service.receipts);

  /**
   * @openapi
   * /v3/search/txns:
   *   get:
   *     summary: Search txns
   *     tags:
   *       - V3 / Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         description: Txn hash
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/txns', validate(request.search), service.txns);
};

export default routes;
