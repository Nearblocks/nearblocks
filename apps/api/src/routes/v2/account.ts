import { Router } from 'express';

import config from '#config';
import schema from '#libs/schema/v2/account';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import txnProxy from '#services/proxy/account-txn';
import { deprecated } from '#services/proxy/deprecated';
import account from '#services/v2/account/index';
import receipts from '#services/v2/account/receipts';

const route = Router();

const proxied = config.v1ProxyEnabled;

const list = proxied ? txnProxy.v2Receipts : receipts.receipts;
const count = proxied ? txnProxy.v2ReceiptsCount : receipts.receiptsCount;
const inventory = proxied ? deprecated : account.inventory;

// The proxy emits the v3 opaque cursor in place of the numeric `receipts.id`.
const listSchema = proxied ? txnProxy.schemas.v2Receipts : schema.receipts;

const routes = (app: Router) => {
  app.use('/account', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v2/account/{account}/receipts:
   *   get:
   *     summary: Get account receipts by pagination
   *     tags:
   *       - Legacy / V2 Account
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *         examples:
   *           account:
   *             value: example-account-id
   *       - in: query
   *         name: from
   *         description: Sender account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: to
   *         description: Receiver account ID
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
   *         name: after_timestamp
   *         description: Nanosecond timestamp
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_timestamp
   *         description: Nanosecond timestamp
   *         schema:
   *           type: string
   *       - in: query
   *         name: cursor
   *         description: Next page cursor, takes precedence over 'page' if provided
   *         schema:
   *           type: string
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
   *         schema:
   *           type: integer
   *           default: 25
   *           minimum: 1
   *           maximum: 100
   *       - in: query
   *         name: order
   *         description: Sort order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *           default: desc
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/receipts', validator(listSchema), list);

  /**
   * @openapi
   * /v2/account/{account}/receipts/count:
   *   get:
   *     summary: Get estimated account receipts count
   *     tags:
   *       - Legacy / V2 Account
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *         examples:
   *           account:
   *             value: example-account-id
   *       - in: query
   *         name: from
   *         description: Sender account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: to
   *         description: Receiver account ID
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
   *         name: after_timestamp
   *         description: Nanosecond timestamp
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_timestamp
   *         description: Nanosecond timestamp
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/receipts/count', validator(schema.receiptsCount), count);

  route.get('/:account/inventory/mts', validator(schema.inventory), inventory);
};

export default routes;
