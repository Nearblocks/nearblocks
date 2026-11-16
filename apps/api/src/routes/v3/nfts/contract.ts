import { Router } from 'express';

import request from 'nb-schemas/dist/nfts/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/nfts/contract';

const route = Router();

const routes = (app: Router) => {
  app.use('/nfts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/nfts/{contract}:
   *   get:
   *     summary: Get NFT contract details
   *     description: >-
   *       Returns NEP-171 collection metadata (name, symbol, icon, base URI,
   *       reference) for an NFT contract.
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
   *         $ref: '#/components/responses/nfts.contract'
   */
  route.get('/:contract', validate(request.contract), service.contract);

  /**
   * @openapi
   * /v3/nfts/{contract}/txns:
   *   get:
   *     summary: List NFT contract transfers
   *     description: >-
   *       Returns NFT transfers, mints and burns for a NEP-171 contract, newest
   *       first. Without affected, each transfer appears once (receiving side,
   *       plus burns); with affected, both incoming and outgoing events for that
   *       account are returned. Paginate with the next/prev cursors from
   *       meta.next_page and meta.prev_page.
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
   *         name: affected
   *         description: Account ID; only return balance changes of this account (incoming and outgoing)
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
   *         $ref: '#/components/responses/nfts.txns'
   */
  route.get('/:contract/txns', validate(request.contractTxns), service.txns);

  /**
   * @openapi
   * /v3/nfts/{contract}/txns/count:
   *   get:
   *     summary: Get NFT contract transfer count
   *     x-internal: true
   *     description: >-
   *       Returns the total count for the matching /v3/nfts/{contract}/txns list.
   *       Counts are capped at 10,000; larger values are approximate and end with
   *       a '+'.
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
   *         name: affected
   *         description: Account ID; only return balance changes of this account (incoming and outgoing)
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
   *         $ref: '#/components/responses/nfts.count'
   */
  route.get(
    '/:contract/txns/count',
    internalOnly,
    validate(request.contractTxnCount),
    service.txnCount,
  );

  /**
   * @openapi
   * /v3/nfts/{contract}/holders:
   *   get:
   *     summary: List NFT contract holders
   *     description: >-
   *       Returns accounts holding tokens from a NEP-171 contract with the number
   *       of tokens each holds, ordered by quantity descending, then account ID.
   *       Paginate with the next/prev cursors from meta.next_page and
   *       meta.prev_page.
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
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 25
   *     responses:
   *       200:
   *         $ref: '#/components/responses/nfts.contractHolders'
   */
  route.get(
    '/:contract/holders',
    validate(request.contractHolders),
    service.holders,
  );

  /**
   * @openapi
   * /v3/nfts/{contract}/holders/count:
   *   get:
   *     summary: Get NFT contract holder count
   *     x-internal: true
   *     description: >-
   *       Returns the total count for the /v3/nfts/{contract}/holders list. Counts
   *       are capped at 10,000; larger values end with a '+'.
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
   *         $ref: '#/components/responses/nfts.contractHolderCount'
   */
  route.get(
    '/:contract/holders/count',
    internalOnly,
    validate(request.contractHolderCount),
    service.holderCount,
  );
};

export default routes;
