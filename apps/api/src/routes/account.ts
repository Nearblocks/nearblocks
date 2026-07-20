import { Router } from 'express';

import config from '#config';
import schema from '#libs/schema/account';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import activity from '#services/account/activity';
import ft from '#services/account/ft';
import account from '#services/account/index';
import key from '#services/account/key';
import nft from '#services/account/nft';
import stake from '#services/account/stake';
import txn from '#services/account/txn';
import accountProxy from '#services/proxy/account';
import tokenProxy from '#services/proxy/account-token';
import txnProxy from '#services/proxy/account-txn';
import { deprecated } from '#services/proxy/deprecated';

const route = Router();

const proxied = config.v1ProxyEnabled;

const item = proxied ? accountProxy.item : account.item;
const contract = proxied ? accountProxy.contract : account.contract;
const deployments = proxied ? accountProxy.deployments : account.deployments;
const action = proxied ? accountProxy.action : account.action;
const parse = proxied ? deprecated : account.parse;
const inventory = proxied ? deprecated : account.inventory;
const tokens = proxied ? deprecated : account.tokens;
const keys = proxied ? accountProxy.keys : key.keys;
const keysCount = proxied ? accountProxy.keysCount : key.keysCount;
const txns = proxied ? deprecated : txn.txns;
const txnsCount = proxied ? deprecated : txn.txnsCount;
const txnsOnly = proxied ? txnProxy.txnsOnly : txn.txnsOnly;
const txnsOnlyCount = proxied ? txnProxy.txnsOnlyCount : txn.txnsOnlyCount;
const receipts = proxied ? txnProxy.receipts : txn.receipts;
const receiptsCount = proxied ? txnProxy.receiptsCount : txn.receiptsCount;
const ftTxns = proxied ? tokenProxy.ftTxns : ft.txns;
const ftTxnsCount = proxied ? tokenProxy.ftTxnsCount : ft.txnsCount;
const nftTxns = proxied ? tokenProxy.nftTxns : nft.txns;
const nftTxnsCount = proxied ? tokenProxy.nftTxnsCount : nft.txnsCount;
const stakeTxns = proxied ? deprecated : stake.txns;
const stakeTxnsCount = proxied ? deprecated : stake.txnsCount;
const activities = proxied ? deprecated : activity.changes;
const activitiesCount = proxied ? deprecated : activity.changesCount;

// The proxy emits the v3 opaque cursor, which the legacy zod rules reject.
const txnsOnlySchema = proxied ? txnProxy.schemas.txnsOnly : schema.txnsOnly;
const receiptsSchema = proxied ? txnProxy.schemas.receipts : schema.receipts;
const ftTxnsSchema = proxied ? tokenProxy.schemas.ftTxns : schema.ftTxns;
const nftTxnsSchema = proxied ? tokenProxy.schemas.nftTxns : schema.nftTxns;

const routes = (app: Router) => {
  app.use('/account', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v1/account/{account}:
   *   get:
   *     summary: Get account info
   *     tags:
   *       - Legacy / Account
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
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account', validator(schema.item), item);

  /**
   * @openapi
   * /v1/account/{account}/contract:
   *   get:
   *     summary: Get contract info
   *     tags:
   *       - Legacy / Account
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
   *     responses:
   *       '200':
   *         description: Success response
   */
  route.get('/:account/contract', validator(schema.contract), contract);

  /**
   * @openapi
   * /v1/account/{account}/contract/deployments:
   *   get:
   *     summary: Get contract deployment records (first & last)
   *     tags:
   *       - Legacy / Account
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
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:account/contract/deployments',
    validator(schema.deployments),
    deployments,
  );

  /**
   * @openapi
   * /v1/account/{account}/contract/parse:
   *   get:
   *     summary: Get parsed contract info
   *     tags:
   *       - Legacy / Account
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
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/contract/parse', validator(schema.contract), parse);

  /**
   * @openapi
   * /v1/account/{account}/contract/{method}:
   *   get:
   *     summary: Get latest action args for contract method
   *     tags:
   *       - Legacy / Account
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
   *       - in: path
   *         name: method
   *         required: true
   *         description: Method name
   *         schema:
   *           type: string
   *         examples:
   *           method:
   *             value: example-method
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/contract/:method', validator(schema.action), action);

  /**
   * @openapi
   * /v1/account/{account}/inventory:
   *   get:
   *     summary: Get account ft/nft token inventory
   *     tags:
   *       - Legacy / Account
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
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/inventory', validator(schema.inventory), inventory);

  /**
   * @openapi
   * /v1/account/{account}/tokens:
   *   get:
   *     summary: Get possible ft/nft token contracts
   *     tags:
   *       - Legacy / Account
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
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/tokens', validator(schema.tokens), tokens);

  /**
   * @openapi
   * /v1/account/{account}/keys:
   *   get:
   *     summary: Get access keys by pagination
   *     tags:
   *       - Legacy / Account
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
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
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
  route.get('/:account/keys', validator(schema.keys), keys);

  /**
   * @openapi
   * /v1/account/{account}/keys/count:
   *   get:
   *     summary: Get estimated access keys count
   *     tags:
   *       - Legacy / Account
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
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/keys/count', validator(schema.keysCount), keysCount);

  /**
   * @openapi
   * /v1/account/{account}/txns:
   *   get:
   *     summary: Get account txns by pagination (NOT RECOMMENDED)
   *     description: |
   *       **NOT RECOMMENDED**: This endpoint is no longer recommended for large accounts due to performance issue.
   *       For large accounts, it is better to query txns and receipts separately:
   *       - account/{account_id}/txns-only
   *       - account/{account_id}/receipts
   *     tags:
   *       - Legacy / Account
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
   *         name: after_block
   *         description: Block height
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_block
   *         description: Block height
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
   *           type: integer
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
   *         schema:
   *           type: integer
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
  route.get('/:account/txns', validator(schema.txns), txns);

  /**
   * @openapi
   * /v1/account/{account}/txns/count:
   *   get:
   *     summary: Get estimated account txns count
   *     tags:
   *       - Legacy / Account
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
   *         name: after_block
   *         description: Block height
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_block
   *         description: Block height
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
  route.get('/:account/txns/count', validator(schema.txnsCount), txnsCount);

  /**
   * @openapi
   * /v1/account/{account}/txns-only:
   *   get:
   *     summary: Get account txns without receipts by pagination
   *     tags:
   *       - Legacy / Account
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
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *       - in: query
   *         name: order
   *         description: Sort order
   *         schema:
   *           type: string
   *           enum:
   *             - desc
   *             - asc
   *           default: desc
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/txns-only', validator(txnsOnlySchema), txnsOnly);

  /**
   * @openapi
   * /v1/account/{account}/txns-only/count:
   *   get:
   *     summary: Get estimated account txns without receipts count
   *     tags:
   *       - Legacy / Account
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
  route.get(
    '/:account/txns-only/count',
    validator(schema.txnsOnlyCount),
    txnsOnlyCount,
  );

  /**
   * @openapi
   * /v1/account/{account}/receipts:
   *   get:
   *     summary: Get account receipts by pagination
   *     tags:
   *       - Legacy / Account
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
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
   *         schema:
   *           type: integer
   *           default: 25
   *           minimum: 1
   *           maximum: 250
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
  route.get('/:account/receipts', validator(receiptsSchema), receipts);

  /**
   * @openapi
   * /v1/account/{account}/receipts/count:
   *   get:
   *     summary: Get estimated account receipts count
   *     tags:
   *       - Legacy / Account
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
  route.get(
    '/:account/receipts/count',
    validator(schema.receiptsCount),
    receiptsCount,
  );

  /**
   * @openapi
   * /v1/account/{account}/ft-txns:
   *   get:
   *     summary: Get account token txns by pagination
   *     tags:
   *       - Legacy / Account
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
   *         name: involved
   *         description: Involved account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: contract
   *         description: Contract account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: event
   *         description: Event kind
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
   *           minLength: 36
   *           maxLength: 36
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: integer
   *           default: 1
   *           minimum: 1
   *           maximum: 200
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
   *         schema:
   *           type: integer
   *           default: 25
   *           minimum: 1
   *           maximum: 250
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
  route.get('/:account/ft-txns', validator(ftTxnsSchema), ftTxns);

  /**
   * @openapi
   * /v1/account/{account}/ft-txns/count:
   *   get:
   *     summary: Get estimated account token txns count
   *     tags:
   *       - Legacy / Account
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
   *         name: involved
   *         description: Involved account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: contract
   *         description: Contract account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: event
   *         description: Event kind
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
  route.get(
    '/:account/ft-txns/count',
    validator(schema.ftTxnsCount),
    ftTxnsCount,
  );

  /**
   * @openapi
   * /v1/account/{account}/nft-txns:
   *   get:
   *     summary: Get account nft txns by pagination
   *     tags:
   *       - Legacy / Account
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
   *         name: involved
   *         description: Involved account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: event
   *         description: Event kind
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
   *           minLength: 36
   *           maxLength: 36
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: integer
   *           default: 1
   *           minimum: 1
   *           maximum: 200
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
   *         schema:
   *           type: integer
   *           default: 25
   *           minimum: 1
   *           maximum: 250
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
  route.get('/:account/nft-txns', validator(nftTxnsSchema), nftTxns);

  /**
   * @openapi
   * /v1/account/{account}/nft-txns/count:
   *   get:
   *     summary: Get estimated account nft txns count
   *     tags:
   *       - Legacy / Account
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
   *         name: involved
   *         description: Involved account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: event
   *         description: Event kind
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
  route.get(
    '/:account/nft-txns/count',
    validator(schema.nftTxnsCount),
    nftTxnsCount,
  );

  /**
   * @openapi
   * /v1/account/{account}/stake-txns:
   *   get:
   *     summary: Get account stake txns by pagination
   *     tags:
   *       - Legacy / Account
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
   *           type: integer
   *           default: 1
   *           minimum: 1
   *           maximum: 200
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
   *         schema:
   *           type: integer
   *           default: 25
   *           minimum: 1
   *           maximum: 250
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
  route.get('/:account/stake-txns', validator(schema.stakeTxns), stakeTxns);

  /**
   * @openapi
   * /v1/account/{account}/stake-txns/count:
   *   get:
   *     summary: Get estimated account stake txns count
   *     tags:
   *       - Legacy / Account
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
  route.get(
    '/:account/stake-txns/count',
    validator(schema.stakeTxnsCount),
    stakeTxnsCount,
  );

  /**
   * @openapi
   * /v1/account/{account}/activities:
   *   get:
   *     summary: Get account balance change activities by pagination
   *     tags:
   *       - Legacy / Account
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
   *         name: cursor
   *         description: Next page cursor, takes precedence over 'page' if provided
   *         schema:
   *           type: string
   *           minLength: 36
   *           maxLength: 36
   *       - in: query
   *         name: per_page
   *         description: Number of items per page. Each increment of 25 will count towards rate limit. For example, per page 50 will use 2 credits.
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/activities', validator(schema.activities), activities);

  /**
   * @openapi
   * /v1/account/{account}/activities/count:
   *   get:
   *     summary: Get estimated account balance change activities count
   *     tags:
   *       - Legacy / Account
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
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:account/activities/count',
    validator(schema.activitiesCount),
    activitiesCount,
  );
};

export default routes;
