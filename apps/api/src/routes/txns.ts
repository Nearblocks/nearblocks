import { Router } from 'express';

import schema from '#libs/schema/txns';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import txns from '#services/txns';

const route = Router();

const routes = (app: Router) => {
  app.use('/txns', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v1/txns:
   *   get:
   *     summary: Get txns by pagination
   *     tags:
   *       - Txns
   *     parameters:
   *       - in: query
   *         name: block
   *         description: Block hash
   *         schema:
   *           type: string
   *       - in: query
   *         name: from
   *         description: Sender account id
   *         schema:
   *           type: string
   *       - in: query
   *         name: to
   *         description: Receiver account id
   *         schema:
   *           type: string
   *       - in: query
   *         name: action
   *         description: Action kind
   *         schema:
   *           type: string
   *       - in: query
   *         name: method
   *         description: Function call method
   *         schema:
   *           type: string
   *       - in: query
   *         name: after_date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *       - in: query
   *         name: cursor
   *         description: Next page cursor, takes precedence over 'page' if provided
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit.
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *       - in: query
   *         name: order
   *         description: Sort order
   *         schema:
   *           type: string
   *           enum: [desc, asc]
   *           default: desc
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', validator(schema.list), txns.list);

  /**
   * @openapi
   * /v1/txns/count:
   *   get:
   *     summary: Get estimated total txns count
   *     tags:
   *       - Txns
   *     parameters:
   *       - in: query
   *         name: block
   *         description: Block hash
   *         schema:
   *           type: string
   *       - in: query
   *         name: from
   *         description: Sender account id
   *         schema:
   *           type: string
   *       - in: query
   *         name: to
   *         description: Receiver account id
   *         schema:
   *           type: string
   *       - in: query
   *         name: action
   *         description: Action kind
   *         schema:
   *           type: string
   *       - in: query
   *         name: method
   *         description: Function call method
   *         schema:
   *           type: string
   *       - in: query
   *         name: after_date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_date
   *         description: Date in YYYY-MM-DD format
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/count', validator(schema.count), txns.count);

  /**
   * @openapi
   * /v1/txns/latest:
   *   get:
   *     summary: Get the latest txns
   *     tags:
   *       - Txns
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: Number of latest transactions
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 10
   *           default: 10
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/latest', validator(schema.latest), txns.latest);

  /**
   * @openapi
   * /v1/txns/{hash}:
   *   get:
   *     summary: Get txn info
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
  route.get('/:hash', validator(schema.item), txns.item);

  /**
   * @openapi
   * /v1/txns/{hash}/full:
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
  route.get('/:hash/full', validator(schema.full), txns.full);
};

export default routes;
