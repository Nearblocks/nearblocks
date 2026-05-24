import { RequestHandler, Router } from 'express';

import v3Request from 'nb-schemas/dist/accounts/receipts/request.js';

import schema from '#libs/schema/v2/account';
import {
  countEnvelope,
  listEnvelope,
  proxyResponse,
  renameQuery,
} from '#libs/v2Proxy';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate as validateV3 } from '#middlewares/validate';
import validator from '#middlewares/validator';
import account from '#services/v2/account/index';
import v3Receipts from '#services/v3/accounts/receipts';

const route = Router();

const routes = (app: Router) => {
  app.use('/account', bearerAuth, rateLimiter, route);

  // These legacy v2 endpoints are served from the v3 implementation: rename
  // v2 query params -> v3, validate with the v3 schema, then re-shape the v3
  // `{ data, meta }` envelope back to the v2 shape.
  // NOTE: `after_timestamp`/`after_date` and `order=asc` have no direct v3
  // equivalent and are dropped; cursors are passed through opaquely (clients
  // must paginate using the cursor returned by the proxy).
  const receiptsHandlers: RequestHandler[] = [
    renameQuery({
      before_timestamp: 'before_ts',
      cursor: 'next',
      from: 'predecessor',
      per_page: 'limit',
      to: 'receiver',
    }),
    validateV3(v3Request.receipts),
    proxyResponse(v3Receipts.receipts, listEnvelope('txns')),
  ];

  const receiptsCountHandlers: RequestHandler[] = [
    renameQuery({
      before_date: 'before_ts',
      from: 'predecessor',
      to: 'receiver',
    }),
    validateV3(v3Request.count),
    proxyResponse(v3Receipts.count, countEnvelope('txns')),
  ];

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
  route.get('/:account/receipts', ...receiptsHandlers);

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
  route.get('/:account/receipts/count', ...receiptsCountHandlers);

  route.get(
    '/:account/inventory/mts',
    validator(schema.inventory),
    account.inventory,
  );
};

export default routes;
