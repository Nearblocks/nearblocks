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
   * GET /v1/search
   * @summary Search txn by hash, block by height / hash, account by id, receipt by id, tokens by hex address
   * @tags Search
   * @param {string} keyword.query.required - txn hash / block height / account id / receipt id / hex address
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/', validator(schema.item), search.search);

  /**
   * GET /v1/search/txns
   * @summary Search txns by hash
   * @tags Search
   * @param {string} keyword.query.required - txn hash
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/txns', validator(schema.item), search.txns);

  /**
   * GET /v1/search/blocks
   * @summary Search blocks by hash / height
   * @tags Search
   * @param {[string,number]} keyword.query.required - block height / hash
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/blocks', validator(schema.item), search.blocks);

  /**
   * GET /v1/search/accounts
   * @summary Search accounts by id
   * @tags Search
   * @param {string} keyword.query.required - account id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/accounts', validator(schema.item), search.accounts);

  /**
   * GET /v1/search/receipts
   * @summary Search receipts by id
   * @tags Search
   * @param {string} keyword.query.required - receipt id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/receipts', validator(schema.item), search.receipts);

  /**
   * GET /v1/search/tokens
   * @summary Search tokens by hex address
   * @tags Search
   * @param {string} keyword.query.required - token hex address
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/tokens', validator(schema.item), search.tokens);
};

export default routes;
