import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/assets/request.js';

import internalOnly from '#middlewares/internalOnly';
import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/assets';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/assets/fts:
   *   get:
   *     summary: List account FT balances
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: next
   *         description: Next page cursor. Pass the next_page value returned from the previous response to retrieve the next page of results
   *         schema:
   *           type: string
   *       - in: query
   *         name: prev
   *         description: Previous page cursor. Pass the prev_page value returned from the previous response to retrieve the previous page of results
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/assets/fts', validate(request.fts), service.fts);

  /**
   * @openapi
   * /v3/accounts/{account}/assets/fts/count:
   *   get:
   *     summary: Get account FT balances count
   *     x-internal: true
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:account/assets/fts/count',
    internalOnly,
    validate(request.ftCount),
    service.ftCount,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/assets/nfts:
   *   get:
   *     summary: List account NFT balances
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: next
   *         description: Next page cursor. Pass the next_page value returned from the previous response to retrieve the next page of results
   *         schema:
   *           type: string
   *       - in: query
   *         name: prev
   *         description: Previous page cursor. Pass the prev_page value returned from the previous response to retrieve the previous page of results
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 24
   *           default: 24
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/assets/nfts', validate(request.nfts), service.nfts);

  /**
   * @openapi
   * /v3/accounts/{account}/assets/nfts/count:
   *   get:
   *     summary: Get account NFT balances count
   *     x-internal: true
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:account/assets/nfts/count',
    internalOnly,
    validate(request.nftCount),
    service.nftCount,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/assets/mts/fts:
   *   get:
   *     summary: List account MT (fungible) balances
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: next
   *         description: Next page cursor. Pass the next_page value returned from the previous response to retrieve the next page of results
   *         schema:
   *           type: string
   *       - in: query
   *         name: prev
   *         description: Previous page cursor. Pass the prev_page value returned from the previous response to retrieve the previous page of results
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/assets/mts/fts', validate(request.mtFts), service.mtFts);

  /**
   * @openapi
   * /v3/accounts/{account}/assets/mts/fts/count:
   *   get:
   *     summary: Get account MT (fungible) balances count
   *     x-internal: true
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:account/assets/mts/fts/count',
    internalOnly,
    validate(request.mtFtCount),
    service.mtFtCount,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/assets/mts/nfts:
   *   get:
   *     summary: List account MT (non-fungible) balances
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: next
   *         description: Next page cursor. Pass the next_page value returned from the previous response to retrieve the next page of results
   *         schema:
   *           type: string
   *       - in: query
   *         name: prev
   *         description: Previous page cursor. Pass the prev_page value returned from the previous response to retrieve the previous page of results
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 24
   *           default: 24
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:account/assets/mts/nfts',
    validate(request.mtNfts),
    service.mtNfts,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/assets/mts/nfts/count:
   *   get:
   *     summary: Get account MT (non-fungible) balances count
   *     x-internal: true
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:account/assets/mts/nfts/count',
    internalOnly,
    validate(request.mtNftCount),
    service.mtNftCount,
  );
};

export default routes;
