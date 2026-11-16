import { Router } from 'express';

import request from 'nb-schemas/dist/search/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/search/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/search', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/search:
   *   get:
   *     summary: Search all entities
   *     description: >-
   *       Runs every type-specific search in parallel and returns each result list
   *       (accounts, blocks, keys, fts, mts, nfts, receipts, txns). Lists are empty
   *       when the keyword does not fit that type. Leading and trailing whitespace
   *       is trimmed.
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: Account ID or prefix, block hash or height, transaction or receipt hash, public key, or token contract, symbol or MT token ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/search.search'
   */
  route.get('/', validate(request.search), service.search);

  /**
   * @openapi
   * /v3/search/accounts:
   *   get:
   *     summary: Search accounts
   *     description: >-
   *       Case-insensitive account ID prefix match. Returns up to 5 accounts,
   *       exact match first, then subaccounts, then shortest IDs. Also matches
   *       accounts known only as multi-token holders by exact ID.
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: Account ID or account ID prefix
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/search.accounts'
   */
  route.get('/accounts', validate(request.search), service.accounts);

  /**
   * @openapi
   * /v3/search/blocks:
   *   get:
   *     summary: Search blocks
   *     description: >-
   *       Matches a base58 block hash or a numeric block height exactly. Returns
   *       at most one block.
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: Base58 block hash or block height
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/search.blocks'
   */
  route.get('/blocks', validate(request.search), service.blocks);

  /**
   * @openapi
   * /v3/search/keys:
   *   get:
   *     summary: Search access keys
   *     description: >-
   *       Matches a public key exactly (ed25519, secp256k1 or ml-dsa-65-hash
   *       prefix required). Returns up to 5 active (not deleted) keys with their
   *       account IDs.
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: Public key including curve prefix (e.g. ed25519)
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/search.keys'
   */
  route.get('/keys', validate(request.search), service.keys);

  /**
   * @openapi
   * /v3/search/fts:
   *   get:
   *     summary: Search fungible tokens
   *     description: >-
   *       Matches an FT contract account ID exactly or a token symbol
   *       case-insensitively. Returns up to 5 tokens, exact contract match first,
   *       then by market cap.
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: Token contract account ID or token symbol
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/search.fts'
   */
  route.get('/fts', validate(request.search), service.fts);

  /**
   * @openapi
   * /v3/search/mts:
   *   get:
   *     summary: Search multi-token (MT) FT tokens
   *     description: >-
   *       Matches a multi-token (NEP-245) token ID exactly (case-sensitive).
   *       Returns up to 5 tokens ordered by transfer count.
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: Multi-token token ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/search.mts'
   */
  route.get('/mts', validate(request.search), service.mts);

  /**
   * @openapi
   * /v3/search/nfts:
   *   get:
   *     summary: Search NFTs
   *     description: >-
   *       Matches an NFT contract account ID exactly or a collection symbol
   *       case-insensitively. Returns up to 5 collections, exact contract match
   *       first, then by token count.
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: NFT contract account ID or collection symbol
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/search.nfts'
   */
  route.get('/nfts', validate(request.search), service.nfts);

  /**
   * @openapi
   * /v3/search/receipts:
   *   get:
   *     summary: Search receipts
   *     description: >-
   *       Matches a base58 receipt ID exactly. Returns at most one receipt.
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: Base58 receipt ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/search.receipts'
   */
  route.get('/receipts', validate(request.search), service.receipts);

  /**
   * @openapi
   * /v3/search/txns:
   *   get:
   *     summary: Search transactions
   *     description: >-
   *       Matches a base58 transaction hash or 0x-prefixed RLP hash exactly.
   *       Returns at most one transaction.
   *     tags:
   *       - Search
   *     parameters:
   *       - in: query
   *         name: keyword
   *         required: true
   *         description: Base58 transaction hash or 0x-prefixed RLP hash
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/search.txns'
   */
  route.get('/txns', validate(request.search), service.txns);
};

export default routes;
