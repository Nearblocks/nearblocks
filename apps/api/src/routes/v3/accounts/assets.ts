import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/assets/request.js';

import internalOnly from '#middlewares/internalOnly';
import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/assets';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/assets/fts:
   *   get:
   *     summary: List account FT balances
   *     description: >-
   *       Lists fungible tokens the account holds a non-zero balance of, sorted
   *       by USD value (highest first), then contract. `amount` is in raw token
   *       units (apply `meta.decimals`); `meta.price` is a USD price no older
   *       than 10 minutes, or null. Balances come from a live lookup cached for
   *       60 seconds, falling back to indexed holdings. Paginate with
   *       `next`/`prev` using `meta.next_page`/`meta.prev_page`.
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: next
   *         description: Cursor for the next page, taken from `meta.next_page` of the previous response
   *         schema:
   *           type: string
   *       - in: query
   *         name: prev
   *         description: Cursor for the previous page, taken from `meta.prev_page` of the previous response
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.assets.fts'
   */
  route.get('/:account/assets/fts', validate(request.fts), service.fts);

  /**
   * @openapi
   * /v3/accounts/{account}/assets/fts/count:
   *   get:
   *     summary: Get account FT balances count
   *     x-internal: true
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.assets.ftCount'
   */
  route.get(
    '/:account/assets/fts/count',
    internalOnly,
    validate(request.ftCount),
    service.ftCount,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/assets/fts/{contract}:
   *   get:
   *     summary: Get account FT balance for a specific contract
   *     x-internal: true
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *       - in: path
   *         name: contract
   *         required: true
   *         description: FT contract account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.assets.ftBalance'
   */
  route.get(
    '/:account/assets/fts/:contract',
    internalOnly,
    validate(request.ftBalance),
    service.ftBalance,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/assets/nfts:
   *   get:
   *     summary: List account NFT holdings
   *     description: >-
   *       Lists NFTs currently owned by the account with contract and token
   *       metadata, ordered by token ID (descending, text order) then contract.
   *       Tokens without indexed metadata are omitted. Paginate with
   *       `next`/`prev` using `meta.next_page`/`meta.prev_page`.
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: next
   *         description: Cursor for the next page, taken from `meta.next_page` of the previous response
   *         schema:
   *           type: string
   *       - in: query
   *         name: prev
   *         description: Cursor for the previous page, taken from `meta.prev_page` of the previous response
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
   *         $ref: '#/components/responses/accounts.assets.nfts'
   */
  route.get('/:account/assets/nfts', validate(request.nfts), service.nfts);

  /**
   * @openapi
   * /v3/accounts/{account}/assets/nfts/count:
   *   get:
   *     summary: Get account NFT balances count
   *     x-internal: true
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.assets.nftCount'
   */
  route.get(
    '/:account/assets/nfts/count',
    internalOnly,
    validate(request.nftCount),
    service.nftCount,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/assets/mts/fts:
   *   get:
   *     summary: List account MT (fungible) balances
   *     description: >-
   *       Lists fungible multi-token (NEP-245) balances, such as NEAR Intents
   *       tokens, sorted by USD value (highest first). Only tokens with
   *       `decimals` metadata are included; `amount` is in raw token units and
   *       `token_meta.price` is a USD price no older than 10 minutes, or null.
   *       Paginate with `next`/`prev` using `meta.next_page`/`meta.prev_page`.
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: contract
   *         description: MT contract account ID to filter by, e.g. `intents.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: token
   *         description: MT token ID to filter by
   *         schema:
   *           type: string
   *       - in: query
   *         name: next
   *         description: Cursor for the next page, taken from `meta.next_page` of the previous response
   *         schema:
   *           type: string
   *       - in: query
   *         name: prev
   *         description: Cursor for the previous page, taken from `meta.prev_page` of the previous response
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         description: The number of items to return. Each increment of 25 will count towards rate limit. For example, limit 50 will use 2 credits
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.assets.mtFts'
   */
  route.get('/:account/assets/mts/fts', validate(request.mtFts), service.mtFts);

  /**
   * @openapi
   * /v3/accounts/{account}/assets/mts/fts/count:
   *   get:
   *     summary: Get account MT (fungible) balances count
   *     x-internal: true
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.assets.mtFtCount'
   */
  route.get(
    '/:account/assets/mts/fts/count',
    internalOnly,
    validate(request.mtFtCount),
    service.mtFtCount,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/assets/mts/nfts:
   *   get:
   *     summary: List account MT (non-fungible) holdings
   *     description: >-
   *       Lists non-fungible multi-token (NEP-245) holdings, i.e. tokens
   *       without `decimals` metadata, ordered by token ID (descending, text
   *       order) then contract. Paginate with `next`/`prev` using
   *       `meta.next_page`/`meta.prev_page`.
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *       - in: query
   *         name: next
   *         description: Cursor for the next page, taken from `meta.next_page` of the previous response
   *         schema:
   *           type: string
   *       - in: query
   *         name: prev
   *         description: Cursor for the previous page, taken from `meta.prev_page` of the previous response
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
   *         $ref: '#/components/responses/accounts.assets.mtNfts'
   */
  route.get(
    '/:account/assets/mts/nfts',
    validate(request.mtNfts),
    service.mtNfts,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/assets/mts/nfts/count:
   *   get:
   *     summary: Get account MT (non-fungible) balances count
   *     x-internal: true
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: NEAR account ID, e.g. `alice.near`
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.assets.mtNftCount'
   */
  route.get(
    '/:account/assets/mts/nfts/count',
    internalOnly,
    validate(request.mtNftCount),
    service.mtNftCount,
  );
};

export default routes;
