import { Router } from 'express';

import request from 'nb-schemas/dist/nfts/tokens/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/nfts/token';

const route = Router();

const routes = (app: Router) => {
  app.use('/nfts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/nfts/{contract}/tokens:
   *   get:
   *     summary: List NFT tokens in a contract
   *     tags:
   *       - V3 / NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
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
  route.get('/:contract/tokens', validate(request.list), service.list);

  /**
   * @openapi
   * /v3/nfts/{contract}/tokens/count:
   *   get:
   *     summary: Get NFT token count in a contract
   *     tags:
   *       - V3 / NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/tokens/count',
    validate(request.tokenCount),
    service.tokenCount,
  );

  /**
   * @openapi
   * /v3/nfts/{contract}/tokens/{token}:
   *   get:
   *     summary: Get NFT token details
   *     tags:
   *       - V3 / NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:contract/tokens/:token', validate(request.token), service.token);

  /**
   * @openapi
   * /v3/nfts/{contract}/tokens/{token}/txns:
   *   get:
   *     summary: List NFT token transfers
   *     tags:
   *       - V3 / NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_ts
   *         description: Timestamp in nanoseconds. Return results before this timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
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
  route.get(
    '/:contract/tokens/:token/txns',
    validate(request.txns),
    service.txns,
  );

  /**
   * @openapi
   * /v3/nfts/{contract}/tokens/{token}/txns/count:
   *   get:
   *     summary: Get NFT token transfer count
   *     tags:
   *       - V3 / NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: before_ts
   *         description: Timestamp in nanoseconds. Return results before this timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/tokens/:token/txns/count',
    validate(request.txnCount),
    service.txnCount,
  );
};

export default routes;
