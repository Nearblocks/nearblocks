import { Router } from 'express';

import request from 'nb-schemas/dist/stats/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/stats/index';

const routes = (app: Router) => {
  /**
   * @openapi
   * /v3/stats:
   *   get:
   *     summary: Get network stats
   *     description: >-
   *       Returns the latest network snapshot. NEAR price, market cap and 24h
   *       volume, total and circulating supply (yoctoNEAR), gas price, total
   *       transactions, current TPS, average block time and nodes online.
   *     tags:
   *       - Stats
   *     responses:
   *       200:
   *         $ref: '#/components/responses/stats.stats'
   */
  app.get('/stats', bearerAuth, rateLimiter, service.stats);

  /**
   * @openapi
   * /v3/block-stats:
   *   get:
   *     summary: Get daily block stats
   *     description: >-
   *       Returns one entry per UTC day, newest first, with block, chunk and
   *       shard counts, gas used (gas units), gas price, gas fee and total
   *       supply (yoctoNEAR strings).
   *     tags:
   *       - Stats
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: Number of days to return. Omit to return all available days
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *       - in: query
   *         name: date
   *         description: Return only the entry for this UTC day (YYYY-MM-DD)
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         $ref: '#/components/responses/stats.block'
   */
  app.get(
    '/block-stats',
    bearerAuth,
    rateLimiter,
    validate(request.block),
    service.block,
  );

  /**
   * @openapi
   * /v3/txn-stats:
   *   get:
   *     summary: Get daily transaction stats
   *     description: >-
   *       Returns one entry per UTC day, newest first, with transaction, receipt
   *       and meta-transaction counts. txn_fee and txn_volume (attached
   *       deposits) are in NEAR, not yoctoNEAR.
   *     tags:
   *       - Stats
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: Number of days to return. Omit to return all available days
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *       - in: query
   *         name: date
   *         description: Return only the entry for this UTC day (YYYY-MM-DD)
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         $ref: '#/components/responses/stats.txn'
   */
  app.get(
    '/txn-stats',
    bearerAuth,
    rateLimiter,
    validate(request.txn),
    service.txn,
  );

  /**
   * @openapi
   * /v3/address-stats:
   *   get:
   *     summary: Get daily address stats
   *     description: >-
   *       Returns one entry per UTC day, newest first, with active accounts,
   *       active contracts, new contracts, and meta-transaction accounts and
   *       relayers.
   *     tags:
   *       - Stats
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: Number of days to return. Omit to return all available days
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *       - in: query
   *         name: date
   *         description: Return only the entry for this UTC day (YYYY-MM-DD)
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         $ref: '#/components/responses/stats.address'
   */
  app.get(
    '/address-stats',
    bearerAuth,
    rateLimiter,
    validate(request.address),
    service.address,
  );

  /**
   * @openapi
   * /v3/price-stats:
   *   get:
   *     summary: Get daily NEAR price and market-cap stats
   *     description: >-
   *       Returns one entry per UTC day, newest first, with NEAR price in USD
   *       and BTC and market cap in USD.
   *     tags:
   *       - Stats
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: Number of days to return. Omit to return all available days
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *       - in: query
   *         name: date
   *         description: Return only the entry for this UTC day (YYYY-MM-DD)
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         $ref: '#/components/responses/stats.price'
   */
  app.get(
    '/price-stats',
    bearerAuth,
    rateLimiter,
    validate(request.price),
    service.price,
  );

  /**
   * @openapi
   * /v3/signer-stats:
   *   get:
   *     summary: Get daily signer stats
   *     description: >-
   *       Returns one entry per UTC day, newest first, for the Chain Signatures
   *       MPC signer contract. Transactions, distinct signing accounts and gas
   *       burnt (gas units).
   *     tags:
   *       - Stats
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: Number of days to return. Omit to return all available days
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *       - in: query
   *         name: date
   *         description: Return only the entry for this UTC day (YYYY-MM-DD)
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         $ref: '#/components/responses/stats.signer'
   */
  app.get(
    '/signer-stats',
    bearerAuth,
    rateLimiter,
    validate(request.signer),
    service.signer,
  );

  /**
   * @openapi
   * /v3/signer-stats/total:
   *   get:
   *     summary: Get all-time signer contract transaction and gas totals
   *     description: >-
   *       Returns the all-time sum of the daily signer stats. Transactions to
   *       the Chain Signatures MPC signer contract and gas burnt (gas units).
   *     tags:
   *       - Stats
   *     responses:
   *       200:
   *         $ref: '#/components/responses/stats.signerTotal'
   */
  app.get('/signer-stats/total', bearerAuth, rateLimiter, service.signerTotal);

  /**
   * @openapi
   * /v3/tps-stats:
   *   get:
   *     summary: Get transactions-per-second stats
   *     description: >-
   *       Returns per-minute transaction counts from the last 7 days, newest
   *       first, with a per-shard breakdown. date is a Unix timestamp in seconds
   *       and txns is the total for that minute.
   *     tags:
   *       - Stats
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: Number of minutes to return
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 60
   *           default: 60
   *     responses:
   *       200:
   *         $ref: '#/components/responses/stats.tps'
   */
  app.get(
    '/tps-stats',
    bearerAuth,
    rateLimiter,
    validate(request.tps),
    service.tps,
  );

  /**
   * @openapi
   * /v3/tvl-stats:
   *   get:
   *     summary: Get daily signer total value locked (TVL) stats
   *     description: >-
   *       Returns one entry per UTC day, newest first, with TVL in USD summed
   *       across all tracked protocols, chains and tokens. ⚠️ Response is cached
   *       for 5 minutes.
   *     tags:
   *       - Stats
   *     parameters:
   *       - in: query
   *         name: limit
   *         description: Number of days to return. Omit to return all available days
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *       - in: query
   *         name: date
   *         description: Return only the entry for this UTC day (YYYY-MM-DD)
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         $ref: '#/components/responses/stats.tvl'
   */
  app.get(
    '/tvl-stats',
    bearerAuth,
    rateLimiter,
    validate(request.tvl),
    service.tvl,
  );
};

export default routes;
