import { Router } from 'express';

import request from 'nb-schemas/dist/keys/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/keys/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/keys', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/keys/{key}:
   *   get:
   *     summary: List access keys by public key
   *     description: >-
   *       Returns the active (not deleted) access keys that use this public key,
   *       one per account, most recently changed first, with permission and the
   *       creating transaction. Paginate by passing meta.next_page as next.
   *     tags:
   *       - Keys
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         description: Public key including curve prefix (e.g. ed25519)
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
   *         $ref: '#/components/responses/keys.keys'
   */
  route.get('/:key', validate(request.keys), service.keys);
};

export default routes;
