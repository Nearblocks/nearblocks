import { Router } from 'express';

import schema from '#libs/schema/search';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import search from '#services/search';

const route = Router();

const routes = (app: Router) => {
  app.use('/search', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v1/search:
   *   get:
   *     summary: Search txn by hash, block by height/hash, account by id, receipt by id, tokens by hex address
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: Transaction hash / block height / account ID / receipt ID / hex address
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', validator(schema.item), search.search);

  /**
   * @openapi
   * /v1/search/txns:
   *   get:
   *     summary: Search txns by hash
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: Transaction hash
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/txns', validator(schema.item), search.txns);

  /**
   * @openapi
   * /v1/search/blocks:
   *   get:
   *     summary: Search blocks by hash/height
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: Block height or hash
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *           example: ["block-height", "block-hash"]
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/blocks', validator(schema.item), search.blocks);

  /**
   * @openapi
   * /v1/search/accounts:
   *   get:
   *     summary: Search accounts by id
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/accounts', validator(schema.item), search.accounts);

  /**
   * @openapi
   * /v1/search/receipts:
   *   get:
   *     summary: Search receipts by id
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: Receipt ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/receipts', validator(schema.item), search.receipts);

  /**
   * @openapi
   * /v1/search/tokens:
   *   get:
   *     summary: Search tokens by hex address
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: Token hex address
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/tokens', validator(schema.item), search.tokens);
};

export default routes;
