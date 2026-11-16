import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/stats/request.js';

import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/stats';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/stats:
   *   get:
   *     summary: Get account statistics overview
   *     description: >-
   *       Returns lifetime activity derived from daily transaction stats: first
   *       and last active day, total transactions, days between them, number of
   *       distinct active days and the longest streak of consecutive active
   *       days. Dates are UTC (YYYY-MM-DD); `data` is null if the account has
   *       no activity.
   *     tags:
   *       - Account Stats
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.stats.overview'
   */
  route.get('/:account/stats', validate(request.overview), service.overview);
  /**
   * @openapi
   * /v3/accounts/{account}/stats/heatmap:
   *   get:
   *     summary: Get account transaction heatmap
   *     description: >-
   *       Returns daily transaction counts for roughly the last 12 months
   *       (since the start of the month 11 months ago), newest day first. Same
   *       shape as `/stats/txns`.
   *     tags:
   *       - Account Stats
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.stats.txns'
   */
  route.get(
    '/:account/stats/heatmap',
    validate(request.heatmap),
    service.heatmap,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/stats/txns:
   *   get:
   *     summary: Get account transaction statistics
   *     description: >-
   *       Returns daily transaction counts and unique incoming and outgoing
   *       counterparties, newest day first. Dates are UTC (YYYY-MM-DD).
   *     tags:
   *       - Account Stats
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of most recent days to return (all available days if omitted)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.stats.txns'
   */
  route.get('/:account/stats/txns', validate(request.txns), service.txns);

  /**
   * @openapi
   * /v3/accounts/{account}/stats/balance:
   *   get:
   *     summary: Get account balance history
   *     description: >-
   *       Returns daily snapshots of liquid and staked balance (yoctoNEAR) and
   *       storage usage, newest day first. Dates are UTC (YYYY-MM-DD).
   *     tags:
   *       - Account Stats
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of most recent days to return (all available days if omitted)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.stats.balance'
   */
  route.get(
    '/:account/stats/balance',
    validate(request.balance),
    service.balance,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/stats/near:
   *   get:
   *     summary: Get account NEAR flow statistics
   *     description: >-
   *       Returns daily NEAR received (`amount_in`) and sent (`amount_out`) in
   *       yoctoNEAR, newest day first. Dates are UTC (YYYY-MM-DD).
   *     tags:
   *       - Account Stats
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of most recent days to return (all available days if omitted)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.stats.near'
   */
  route.get('/:account/stats/near', validate(request.near), service.near);

  /**
   * @openapi
   * /v3/accounts/{account}/stats/fts:
   *   get:
   *     summary: Get account FT statistics
   *     description: >-
   *       Returns daily FT activity: transfer count, distinct token contracts
   *       and unique incoming and outgoing counterparties, newest day first.
   *       Dates are UTC (YYYY-MM-DD).
   *     tags:
   *       - Account Stats
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of most recent days to return (all available days if omitted)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.stats.fts'
   */
  route.get('/:account/stats/fts', validate(request.fts), service.fts);

  /**
   * @openapi
   * /v3/accounts/{account}/stats/nfts:
   *   get:
   *     summary: Get account NFT statistics
   *     description: >-
   *       Returns daily NFT activity: transfer count, distinct NFT contracts
   *       and unique incoming and outgoing counterparties, newest day first.
   *       Dates are UTC (YYYY-MM-DD).
   *     tags:
   *       - Account Stats
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of most recent days to return (all available days if omitted)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.stats.nfts'
   */
  route.get('/:account/stats/nfts', validate(request.nfts), service.nfts);

  /**
   * @openapi
   * /v3/accounts/{account}/stats/mts:
   *   get:
   *     summary: Get account MT statistics
   *     description: >-
   *       Returns daily multi-token (NEP-245) activity: transfer count,
   *       distinct contracts and unique incoming and outgoing counterparties,
   *       newest day first. Dates are UTC (YYYY-MM-DD).
   *     tags:
   *       - Account Stats
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of most recent days to return (all available days if omitted)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.stats.mts'
   */
  route.get('/:account/stats/mts', validate(request.mts), service.mts);
};

export default routes;
