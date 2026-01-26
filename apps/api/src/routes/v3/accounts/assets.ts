import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/assets/request.js';

import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/assets';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/assets/fts:
   *   get:
   *     summary: Get account ft assets
   *     tags:
   *       - V3 / Accounts
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
   *           maximum: 100
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
   *     summary: Get account ft assets count
   *     tags:
   *       - V3 / Accounts
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
    validate(request.ftCount),
    service.ftCount,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/assets/nfts:
   *   get:
   *     summary: Get account nft assets
   *     tags:
   *       - V3 / Accounts
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
   *           maximum: 100
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:account/assets/nfts', validate(request.nfts), service.nfts);

  /**
   * @openapi
   * /v3/accounts/{account}/assets/nfts/count:
   *   get:
   *     summary: Get account nft assets count
   *     tags:
   *       - V3 / Accounts
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
    validate(request.nftCount),
    service.nftCount,
  );
};

export default routes;
