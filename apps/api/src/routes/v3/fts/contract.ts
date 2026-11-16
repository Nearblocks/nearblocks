import { Router } from 'express';

import request from 'nb-schemas/dist/fts/request.js';
import statsRequest from 'nb-schemas/dist/fts/stats/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/fts/contract';
import statsService from '#services/v3/fts/stats';

const route = Router();

const routes = (app: Router) => {
  app.use('/fts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/fts/{contract}:
   *   get:
   *     summary: Get FT contract details
   *     description: >-
   *       Returns NEP-141 token metadata (name, symbol, decimals, icon), supply,
   *       price and market data, and social links for a fungible token contract.
   *       Supply values are raw integer strings; apply decimals.
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/fts.contract'
   */
  route.get('/:contract', validate(request.contract), service.contract);

  /**
   * @openapi
   * /v3/fts/{contract}/txns:
   *   get:
   *     summary: List FT contract transfers
   *     description: >-
   *       Returns transfers of a NEP-141 token, newest first. Without affected,
   *       each transfer appears once (receiving side, plus burns); with affected,
   *       both incoming and outgoing balance changes for that account are
   *       returned. Amounts are raw integer strings; timestamps are nanoseconds.
   *       Paginate with the next/prev cursors from meta.next_page and
   *       meta.prev_page.
   *     tags:
   *       - FTs
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
   *         $ref: '#/components/responses/fts.contractTxns'
   */
  route.get('/:contract/txns', validate(request.contractTxns), service.txns);

  /**
   * @openapi
   * /v3/fts/{contract}/txns/count:
   *   get:
   *     summary: Get FT contract transfer count
   *     x-internal: true
   *     description: >-
   *       Returns the total count for the matching /v3/fts/{contract}/txns list.
   *       Counts are capped at 10,000; larger values are approximate and end with
   *       a '+'.
   *     tags:
   *       - FTs
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
   *         $ref: '#/components/responses/fts.contractTxnCount'
   */
  route.get(
    '/:contract/txns/count',
    internalOnly,
    validate(request.contractTxnCount),
    service.txnCount,
  );

  /**
   * @openapi
   * /v3/fts/{contract}/holders:
   *   get:
   *     summary: List FT contract holders
   *     description: >-
   *       Returns accounts holding a non-zero balance of a NEP-141 token, ordered
   *       by balance descending, then account ID. Amounts are raw integer strings;
   *       apply the token's decimals. Paginate with the next/prev cursors from
   *       meta.next_page and meta.prev_page.
   *     tags:
   *       - FTs
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
   *         $ref: '#/components/responses/fts.contractHolders'
   */
  route.get(
    '/:contract/holders',
    validate(request.contractHolders),
    service.holders,
  );

  /**
   * @openapi
   * /v3/fts/{contract}/holders/count:
   *   get:
   *     summary: Get FT contract holder count
   *     x-internal: true
   *     description: >-
   *       Returns the total count for the /v3/fts/{contract}/holders list, read
   *       from the precomputed token list.
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/fts.contractHolderCount'
   */
  route.get(
    '/:contract/holders/count',
    internalOnly,
    validate(request.contractHolderCount),
    service.holderCount,
  );

  /**
   * @openapi
   * /v3/fts/{contract}/stats/overview:
   *   get:
   *     summary: Get FT contract stats overview
   *     description: >-
   *       Returns lifetime transfer activity for a token: first and last active
   *       day, total transfers, active and unique days, and the longest streak of
   *       consecutive active days. Returns null if the token has no recorded
   *       transfers.
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/fts.stats.overview'
   */
  route.get(
    '/:contract/stats/overview',
    validate(statsRequest.overview),
    statsService.overview,
  );

  /**
   * @openapi
   * /v3/fts/{contract}/stats/heatmap:
   *   get:
   *     summary: Get FT contract transfer heatmap (last 11 months, daily)
   *     description: >-
   *       Returns daily transfer counts and unique sender/receiver counts for a
   *       token from the start of the month 11 months ago until today, newest day
   *       first. Dates are UTC YYYY-MM-DD.
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/fts.stats.heatmap'
   */
  route.get(
    '/:contract/stats/heatmap',
    validate(statsRequest.heatmap),
    statsService.heatmap,
  );

  /**
   * @openapi
   * /v3/fts/{contract}/stats/transfers:
   *   get:
   *     summary: Get FT contract daily transfer stats
   *     description: >-
   *       Returns daily transfer statistics for a token (transfer count, raw
   *       transferred amount, unique senders, receivers and accounts), newest day
   *       first. Dates are UTC YYYY-MM-DD.
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
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
   *         $ref: '#/components/responses/fts.stats.transfers'
   */
  route.get(
    '/:contract/stats/transfers',
    validate(statsRequest.transfers),
    statsService.transfers,
  );

  /**
   * @openapi
   * /v3/fts/{contract}/stats/{account}/transfers:
   *   get:
   *     summary: Get daily FT transfer stats for a specific account on a contract
   *     description: >-
   *       Returns daily transfer statistics for one account on a token (transfer
   *       count, raw amounts in and out, unique counterparties in and out), newest
   *       day first. Dates are UTC YYYY-MM-DD.
   *     tags:
   *       - FTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
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
   *         $ref: '#/components/responses/fts.stats.accountTransfers'
   */
  route.get(
    '/:contract/stats/:account/transfers',
    validate(statsRequest.accountTransfers),
    statsService.accountTransfers,
  );
};

export default routes;
