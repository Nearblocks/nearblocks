import { Router } from 'express';

import statsRequest from 'nb-schemas/dist/mts/stats/request.js';
import request from 'nb-schemas/dist/mts/tokens/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import statsService from '#services/v3/mts/stats';
import service from '#services/v3/mts/token';

const route = Router({ mergeParams: true });

const routes = (app: Router) => {
  app.use('/mts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/mts/{contract}/tokens:
   *   get:
   *     summary: List MT tokens in a contract
   *     description: >-
   *       Returns tokens of a NEP-245 multi-token contract (for example
   *       intents.near) with metadata, price and owner. Filter by kind with type;
   *       type=ft sorts by price descending, otherwise tokens are ordered by token
   *       ID. Paginate with the next/prev cursors from meta.next_page and
   *       meta.prev_page.
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: type
   *         description: Token kind. ft (tokens with decimals) is sorted by price descending; nft lists tokens without decimals by token ID. If omitted, fungible tokens are listed by token ID
   *         schema:
   *           type: string
   *           enum: [ft, nft]
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
   *         description: The number of items to return (max 36)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 36
   *           default: 25
   *     responses:
   *       200:
   *         $ref: '#/components/responses/mts.tokens.list'
   */
  route.get('/:contract/tokens', validate(request.list), service.list);

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/count:
   *   get:
   *     summary: Get MT token count in a contract
   *     x-internal: true
   *     description: >-
   *       Returns the total count for the /v3/mts/{contract}/tokens list,
   *       optionally filtered by type.
   *     tags:
   *       - MTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: type
   *         description: Only count tokens of this kind. ft has decimals, nft does not. Counts all tokens if omitted
   *         schema:
   *           type: string
   *           enum: [ft, nft]
   *     responses:
   *       200:
   *         $ref: '#/components/responses/mts.tokens.count'
   */
  route.get(
    '/:contract/tokens/count',
    internalOnly,
    validate(request.tokenCount),
    service.tokenCount,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}:
   *   get:
   *     summary: Get MT token details
   *     description: >-
   *       Returns metadata (name, symbol, decimals, icon, title, media), current
   *       price where known, and owner for a single NEP-245 token, such as
   *       nep141:wrap.near on intents.near.
   *     tags:
   *       - MTs
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
   *         description: Token ID within the contract, e.g. nep141:wrap.near
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/mts.tokens.token'
   */
  route.get('/:contract/tokens/:token', validate(request.token), service.token);

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/txns:
   *   get:
   *     summary: List MT token transfers
   *     description: >-
   *       Returns transfers of a single NEP-245 token, newest first. Without
   *       affected, each transfer appears once (receiving side, plus burns); with
   *       affected, both incoming and outgoing balance changes are returned.
   *       Amounts are raw integer strings. Paginate with the next/prev cursors
   *       from meta.next_page and meta.prev_page.
   *     tags:
   *       - MTs
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
   *         description: Token ID within the contract, e.g. nep141:wrap.near
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
   *         $ref: '#/components/responses/mts.tokens.txns'
   */
  route.get(
    '/:contract/tokens/:token/txns',
    validate(request.txns),
    service.txns,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/txns/count:
   *   get:
   *     summary: Get MT token transfer count
   *     x-internal: true
   *     description: >-
   *       Returns the total count for the matching
   *       /v3/mts/{contract}/tokens/{token}/txns list. Counts are capped at
   *       10,000; larger values are approximate and end with a '+'.
   *     tags:
   *       - MTs
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
   *         description: Token ID within the contract, e.g. nep141:wrap.near
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
   *         $ref: '#/components/responses/mts.tokens.txnCount'
   */
  route.get(
    '/:contract/tokens/:token/txns/count',
    internalOnly,
    validate(request.txnCount),
    service.txnCount,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/holders:
   *   get:
   *     summary: List MT token holders
   *     description: >-
   *       Returns accounts holding a non-zero balance of a single NEP-245 token,
   *       ordered by balance descending, then account ID. Amounts are raw integer
   *       strings. Paginate with the next/prev cursors from meta.next_page and
   *       meta.prev_page.
   *     tags:
   *       - MTs
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
   *         description: Token ID within the contract, e.g. nep141:wrap.near
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
   *         $ref: '#/components/responses/mts.tokens.holders'
   */
  route.get(
    '/:contract/tokens/:token/holders',
    validate(request.tokenHolders),
    service.holders,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/holders/count:
   *   get:
   *     summary: Get MT token holder count
   *     x-internal: true
   *     description: >-
   *       Returns the total count for the
   *       /v3/mts/{contract}/tokens/{token}/holders list, read from the
   *       precomputed token list.
   *     tags:
   *       - MTs
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
   *         description: Token ID within the contract, e.g. nep141:wrap.near
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/mts.tokens.holderCount'
   */
  route.get(
    '/:contract/tokens/:token/holders/count',
    internalOnly,
    validate(request.tokenHolderCount),
    service.holderCount,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/nft-tokens/{token}/txns/count:
   *   get:
   *     summary: Get MT NFT-style token transfer count
   *     x-internal: true
   *     description: >-
   *       Returns the transfer count for a non-fungible NEP-245 token, using the
   *       same filters as /v3/mts/{contract}/tokens/{token}/txns. Counts are
   *       capped at 10,000; larger values are approximate and end with a '+'.
   *     tags:
   *       - MTs
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
   *         description: Non-fungible token ID within the contract
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
   *         $ref: '#/components/responses/mts.tokens.txnCount'
   */
  route.get(
    '/:contract/nft-tokens/:token/txns/count',
    internalOnly,
    validate(request.txnCount),
    service.nftTxnCount,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/stats/overview:
   *   get:
   *     summary: Get MT token stats overview
   *     description: >-
   *       Returns lifetime transfer activity for a NEP-245 token: first and last
   *       active day, total transfers, active and unique days, and the longest
   *       streak of consecutive active days.
   *     tags:
   *       - MTs
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
   *         description: Token ID within the contract, e.g. nep141:wrap.near
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/mts.stats.overview'
   */
  route.get(
    '/:contract/tokens/:token/stats/overview',
    validate(statsRequest.overview),
    statsService.overview,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/stats/heatmap:
   *   get:
   *     summary: Get MT token transfer heatmap (last 11 months, daily)
   *     description: >-
   *       Returns daily transfer counts and unique sender/receiver counts for a
   *       NEP-245 token from the start of the month 11 months ago until today,
   *       newest day first. Dates are UTC YYYY-MM-DD.
   *     tags:
   *       - MTs
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
   *         description: Token ID within the contract, e.g. nep141:wrap.near
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/mts.stats.heatmap'
   */
  route.get(
    '/:contract/tokens/:token/stats/heatmap',
    validate(statsRequest.heatmap),
    statsService.heatmap,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/stats/transfers:
   *   get:
   *     summary: Get MT token daily transfer stats
   *     description: >-
   *       Returns daily transfer statistics for a NEP-245 token, newest day first.
   *       Amounts are raw integer strings; dates are UTC YYYY-MM-DD.
   *     tags:
   *       - MTs
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
   *         description: Token ID within the contract, e.g. nep141:wrap.near
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of days to return (max 365)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *           default: 25
   *     responses:
   *       200:
   *         $ref: '#/components/responses/mts.stats.transfers'
   */
  route.get(
    '/:contract/tokens/:token/stats/transfers',
    validate(statsRequest.transfers),
    statsService.transfers,
  );

  /**
   * @openapi
   * /v3/mts/{contract}/tokens/{token}/stats/{account}/transfers:
   *   get:
   *     summary: Get daily MT transfer stats for a specific account on a token
   *     description: >-
   *       Returns daily transfer statistics for one account on a NEP-245 token,
   *       newest day first. Amounts are raw integer strings; dates are UTC YYYY-
   *       MM-DD.
   *     tags:
   *       - MTs
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
   *         description: Token ID within the contract, e.g. nep141:wrap.near
   *         schema:
   *           type: string
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of days to return (max 365)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *           default: 25
   *     responses:
   *       200:
   *         $ref: '#/components/responses/mts.stats.accountTransfers'
   */
  route.get(
    '/:contract/tokens/:token/stats/:account/transfers',
    validate(statsRequest.accountTransfers),
    statsService.accountTransfers,
  );
};

export default routes;
