import { Router } from 'express';

import request from 'nb-schemas/dist/validators/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/validators/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/validators', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/validators:
   *   get:
   *     summary: List validators
   *     description: >-
   *       Returns validators from the current epoch data with stake, block and
   *       chunk production, fees and pool metadata, ordered by current epoch
   *       stake (highest first, nulls last). Paginate by passing meta.next_page
   *       as next (or meta.prev_page as prev). Stakes are yoctoNEAR strings.
   *     tags:
   *       - Validators
   *     parameters:
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
   *         description: Number of validators to return. Validator endpoints always use 1 rate-limit credit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 25
   *     responses:
   *       200:
   *         $ref: '#/components/responses/validators.list'
   */
  route.get('/', validate(request.list), service.list);

  /**
   * @openapi
   * /v3/validators/info:
   *   get:
   *     summary: Get validator network info
   *     description: >-
   *       Returns epoch-level network info. Current and next epoch seat price,
   *       total stake (yoctoNEAR), epoch start height and timestamp, epoch
   *       length, protocol version, last epoch APY and validator counts.
   *     tags:
   *       - Validators
   *     responses:
   *       200:
   *         $ref: '#/components/responses/validators.info'
   */
  route.get('/info', service.info);

  /**
   * @openapi
   * /v3/validators/{account}:
   *   get:
   *     summary: Get validator details
   *     description: >-
   *       Returns a single validator with the same fields as the list endpoint.
   *       data is null if the account is not in the current validator data.
   *     tags:
   *       - Validators
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Validator staking pool account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/validators.detail'
   */
  route.get('/:account', validate(request.detail), service.detail);

  /**
   * @openapi
   * /v3/validators/{account}/stats/blocks:
   *   get:
   *     summary: Get validator daily blocks produced
   *     description: >-
   *       Returns the number of blocks produced by the validator per UTC day,
   *       newest first.
   *     tags:
   *       - Validators
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Validator staking pool account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of days to return. Omit to return all available days
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/validators.blocks'
   */
  route.get('/:account/stats/blocks', validate(request.blocks), service.blocks);

  /**
   * @openapi
   * /v3/validators/{account}/stats/chunks:
   *   get:
   *     summary: Get validator daily chunks produced
   *     description: >-
   *       Returns the number of chunks produced by the validator per UTC day,
   *       newest first.
   *     tags:
   *       - Validators
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Validator staking pool account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: Number of days to return. Omit to return all available days
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 365
   *     responses:
   *       200:
   *         $ref: '#/components/responses/validators.chunks'
   */
  route.get('/:account/stats/chunks', validate(request.chunks), service.chunks);
};

export default routes;
