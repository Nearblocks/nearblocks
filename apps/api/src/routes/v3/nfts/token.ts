import { Router } from 'express';

import request from 'nb-schemas/dist/nfts/tokens/request.js';

import internalOnly from '#middlewares/internalOnly';
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
   *     description: >-
   *       Returns tokens of a NEP-171 contract with title, media, reference and
   *       current owner, ordered by token ID ascending. Paginate forward with the
   *       next cursor from meta.next_page.
   *     tags:
   *       - NFTs
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
   *         description: The number of items to return (max 24)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 24
   *           default: 24
   *     responses:
   *       200:
   *         $ref: '#/components/responses/nfts.tokens.list'
   */
  route.get('/:contract/tokens', validate(request.list), service.list);

  /**
   * @openapi
   * /v3/nfts/{contract}/tokens/count:
   *   get:
   *     summary: Get NFT token count in a contract
   *     x-internal: true
   *     description: >-
   *       Returns the total count for the /v3/nfts/{contract}/tokens list.
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/nfts.tokens.count'
   */
  route.get(
    '/:contract/tokens/count',
    internalOnly,
    validate(request.tokenCount),
    service.tokenCount,
  );

  /**
   * @openapi
   * /v3/nfts/{contract}/tokens/{token}:
   *   get:
   *     summary: Get NFT token details
   *     description: >-
   *       Returns metadata and the current owner of a single NEP-171 token.
   *     tags:
   *       - NFTs
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
   *         description: NFT token ID within the contract
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/nfts.tokens.token'
   */
  route.get('/:contract/tokens/:token', validate(request.token), service.token);

  /**
   * @openapi
   * /v3/nfts/{contract}/tokens/{token}/txns:
   *   get:
   *     summary: List NFT token transfers
   *     description: >-
   *       Returns transfers, mints and burns of a single NEP-171 token, newest
   *       first. Timestamps are nanoseconds. Paginate with the next/prev cursors
   *       from meta.next_page and meta.prev_page.
   *     tags:
   *       - NFTs
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
   *         description: NFT token ID within the contract
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
   *         $ref: '#/components/responses/nfts.tokens.txns'
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
   *     x-internal: true
   *     description: >-
   *       Returns the total count for the matching
   *       /v3/nfts/{contract}/tokens/{token}/txns list. Counts are capped at
   *       10,000; larger values end with a '+'.
   *     tags:
   *       - NFTs
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
   *         description: NFT token ID within the contract
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
   *         $ref: '#/components/responses/nfts.tokens.txnCount'
   */
  route.get(
    '/:contract/tokens/:token/txns/count',
    internalOnly,
    validate(request.txnCount),
    service.txnCount,
  );
};

export default routes;
