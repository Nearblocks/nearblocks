import { Router } from 'express';

import request from 'nb-schemas/dist/mts/request.js';

import internalOnly from '#middlewares/internalOnly';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/mts/contract';

const route = Router({ mergeParams: true });

const routes = (app: Router) => {
  app.use('/mts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/mts/{contract}/txns:
   *   get:
   *     summary: List MT contract transfers
   *     description: >-
   *       Returns NEP-245 multi-token transfers for a contract, newest first,
   *       optionally limited to one token ID. Without affected, each transfer
   *       appears once (receiving side, plus burns); with affected, both incoming
   *       and outgoing balance changes are returned. Amounts are raw integer
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
   *       - in: query
   *         name: affected
   *         description: Account ID; only return balance changes of this account (incoming and outgoing)
   *         schema:
   *           type: string
   *       - in: query
   *         name: token
   *         description: Only return transfers of this token ID, e.g. nep141:wrap.near
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
   *         $ref: '#/components/responses/mts.contractTxns'
   */
  route.get('/:contract/txns', validate(request.contractTxns), service.txns);

  /**
   * @openapi
   * /v3/mts/{contract}/txns/count:
   *   get:
   *     summary: Get MT contract transfer count
   *     x-internal: true
   *     description: >-
   *       Returns the total count for the matching /v3/mts/{contract}/txns list.
   *       Counts are capped at 10,000; larger values are approximate and end with
   *       a '+'.
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
   *         name: affected
   *         description: Account ID; only return balance changes of this account (incoming and outgoing)
   *         schema:
   *           type: string
   *       - in: query
   *         name: token
   *         description: Only return transfers of this token ID, e.g. nep141:wrap.near
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
   *         $ref: '#/components/responses/mts.contractTxnCount'
   */
  route.get(
    '/:contract/txns/count',
    internalOnly,
    validate(request.contractTxnCount),
    service.txnCount,
  );
};

export default routes;
