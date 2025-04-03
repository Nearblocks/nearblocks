import { Router } from 'express';

import schema from '#libs/schema/v2/txns';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import txns from '#services/v2/txns';

const route = Router();

const routes = (app: Router) => {
  app.use('/txns', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v2/txns/{hash}:
   *   get:
   *     summary: Get txn info with receipts and execution outcomes
   *     tags:
   *       - Txns
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Transaction hash
   *         schema:
   *           type: string
   *         examples:
   *           hash:
   *             value: example-txn-hash
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:hash', validator(schema.txn), txns.txn);

  /**
   * @openapi
   * /v2/txns/{hash}/receipts:
   *   get:
   *     summary: Get txn receipts
   *     tags:
   *       - Txns
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: Transaction hash
   *         schema:
   *           type: string
   *         examples:
   *           hash:
   *             value: example-txn-hash
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:hash/receipts', validator(schema.txnReceipts), txns.txnReceipts);
};

export default routes;
