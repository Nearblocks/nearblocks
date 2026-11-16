import { Router } from 'express';

import request from 'nb-schemas/dist/intents/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/intents/index';

const route = Router({ mergeParams: true });

const routes = (app: Router) => {
  app.use('/intents', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/intents/txns:
   *   get:
   *     summary: List NEAR Intents transfers
   *     description: >-
   *       Returns NEP-245 balance-change events on the NEAR Intents contract
   *       (intents.near), newest first, with token metadata and the token's daily
   *       USD price at the time of the event where known. Amounts are raw integer
   *       strings; timestamps are nanoseconds. Paginate with the next/prev cursors
   *       from meta.next_page and meta.prev_page.
   *     tags:
   *       - Intents
   *     parameters:
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
   *         $ref: '#/components/responses/intents.txns'
   */
  route.get('/txns', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/intents/txns/count:
   *   get:
   *     summary: Get NEAR Intents transfer count
   *     x-internal: true
   *     description: >-
   *       Returns the total count for the matching /v3/intents/txns list. Counts
   *       are capped at 10,000; larger values are approximate and end with a '+'.
   *     tags:
   *       - Intents
   *     parameters:
   *       - in: query
   *         name: before_ts
   *         description: Timestamp in nanoseconds. Return results before this timestamp (exclusive)
   *         schema:
   *           type: string
   *           minLength: 19
   *           maxLength: 19
   *     responses:
   *       200:
   *         $ref: '#/components/responses/intents.count'
   */
  route.get(
    '/txns/count',
    internalOnly,
    validate(request.count),
    service.txnCount,
  );

  /**
   * @openapi
   * /v3/intents/volume-stats:
   *   get:
   *     summary: Get daily and cumulative NEAR Intents swap volume (USD)
   *     description: >-
   *       Returns daily swap volume in USD with a running cumulative total, newest
   *       day first. Pass date for a single day or limit for the most recent N
   *       days; all days are returned if neither is set.
   *     tags:
   *       - Intents
   *     parameters:
   *       - in: query
   *         name: date
   *         description: Only return this UTC day (YYYY-MM-DD)
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of most recent days to return. All days are returned if omitted
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/intents.volumeStats'
   */
  route.get(
    '/volume-stats',
    validate(request.volumeStats),
    service.volumeStats,
  );

  /**
   * @openapi
   * /v3/intents/swap-stats:
   *   get:
   *     summary: Get daily and cumulative NEAR Intents swap counts
   *     description: >-
   *       Returns the daily number of swaps with a running cumulative total,
   *       newest day first. Pass date for a single day or limit for the most
   *       recent N days; all days are returned if neither is set.
   *     tags:
   *       - Intents
   *     parameters:
   *       - in: query
   *         name: date
   *         description: Only return this UTC day (YYYY-MM-DD)
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of most recent days to return. All days are returned if omitted
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/intents.swapStats'
   */
  route.get('/swap-stats', validate(request.swapStats), service.swapStats);

  /**
   * @openapi
   * /v3/intents/volume-stats/assets:
   *   get:
   *     summary: Get daily NEAR Intents swap volume/swaps broken down by asset
   *     description: >-
   *       Returns per-token swap volume (raw and USD) and swap counts for each
   *       day, newest day first and sorted by USD volume within a day. limit
   *       counts days, not rows.
   *     tags:
   *       - Intents
   *     parameters:
   *       - in: query
   *         name: date
   *         description: Only return this UTC day (YYYY-MM-DD)
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of most recent days to return. All days are returned if omitted
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/intents.statsAssets'
   */
  route.get(
    '/volume-stats/assets',
    validate(request.statsAssets),
    service.statsAssets,
  );

  /**
   * @openapi
   * /v3/intents/volume-stats/blockchains:
   *   get:
   *     summary: Get daily NEAR Intents swap volume/swaps broken down by blockchain
   *     description: >-
   *       Returns USD swap volume and swap counts per source blockchain for each
   *       day, newest day first and sorted by volume within a day. limit counts
   *       days, not rows.
   *     tags:
   *       - Intents
   *     parameters:
   *       - in: query
   *         name: date
   *         description: Only return this UTC day (YYYY-MM-DD)
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of most recent days to return. All days are returned if omitted
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/intents.statsBlockchains'
   */
  route.get(
    '/volume-stats/blockchains',
    validate(request.statsBlockchains),
    service.statsBlockchains,
  );

  /**
   * @openapi
   * /v3/intents/token-stats:
   *   get:
   *     summary: Get daily count of unique NEAR Intents tokens swapped
   *     description: >-
   *       Returns the number of distinct tokens swapped on NEAR Intents per day,
   *       newest day first.
   *     tags:
   *       - Intents
   *     parameters:
   *       - in: query
   *         name: date
   *         description: Only return this UTC day (YYYY-MM-DD)
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of most recent days to return. All days are returned if omitted
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/intents.tokenStats'
   */
  route.get('/token-stats', validate(request.tokenStats), service.tokenStats);

  /**
   * @openapi
   * /v3/intents/blockchain-stats:
   *   get:
   *     summary: Get daily count of unique blockchains active on NEAR Intents
   *     description: >-
   *       Returns the number of distinct blockchains with NEAR Intents swap
   *       activity per day, newest day first.
   *     tags:
   *       - Intents
   *     parameters:
   *       - in: query
   *         name: date
   *         description: Only return this UTC day (YYYY-MM-DD)
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of most recent days to return. All days are returned if omitted
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/intents.blockchainStats'
   */
  route.get(
    '/blockchain-stats',
    validate(request.blockchainStats),
    service.blockchainStats,
  );

  /**
   * @openapi
   * /v3/intents/account-stats:
   *   get:
   *     summary: Get daily count of unique accounts swapping on NEAR Intents
   *     description: >-
   *       Returns the number of unique accounts swapping on NEAR Intents per day,
   *       newest day first.
   *     tags:
   *       - Intents
   *     parameters:
   *       - in: query
   *         name: date
   *         description: Only return this UTC day (YYYY-MM-DD)
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of most recent days to return. All days are returned if omitted
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/intents.accountStats'
   */
  route.get(
    '/account-stats',
    validate(request.accountStats),
    service.accountStats,
  );

  /**
   * @openapi
   * /v3/intents/stats:
   *   get:
   *     summary: Get NEAR Intents stats overview
   *     description: >-
   *       Returns all-time swap volume (USD), swap count, token and blockchain
   *       counts, the same figures for the previous full UTC day, previous-day
   *       active accounts and 30-day unique accounts. Cached for 60 seconds.
   *     tags:
   *       - Intents
   *     responses:
   *       200:
   *         $ref: '#/components/responses/intents.statsOverview'
   */
  route.get('/stats', service.statsOverview);
};

export default routes;
