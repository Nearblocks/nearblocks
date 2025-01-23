import { Router } from 'express';

import schema from '#libs/schema/nfts';
import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import validator from '#middlewares/validator';
import contract from '#services/nfts/contract';
import nft from '#services/nfts/index';
import tokens from '#services/nfts/tokens';

const route = Router();

const routes = (app: Router) => {
  app.use('/nfts', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v1/nfts:
   *   get:
   *     summary: Get top NFTs by pagination
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: query
   *         name: search.query
   *         description: Search keyword
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 100
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 50
   *           default: 50
   *       - in: query
   *         name: order
   *         description: Sort order
   *         schema:
   *           type: string
   *           enum: [desc, asc]
   *           default: desc
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/', validator(schema.list), nft.list);

  /**
   * @openapi
   * /v1/nfts/count:
   *   get:
   *     summary: Get top NFTs count
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: query
   *         name: search.query
   *         description: Search keyword
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/count', validator(schema.count), nft.count);

  /**
   * @openapi
   * /v1/nfts/txns:
   *   get:
   *     summary: Get NFT transactions by pagination
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: query
   *         name: cursor.query
   *         description: Next page cursor, takes precedence over 'page' if provided
   *         schema:
   *           type: string
   *           minLength: 36
   *           maxLength: 36
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/txns', validator(schema.txns), nft.txns);

  /**
   * @openapi
   * /v1/nfts/txns/count:
   *   get:
   *     summary: Get estimated NFT transactions count
   *     tags:
   *       - NFTs
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/txns/count', validator(schema.txnsCount), nft.txnsCount);

  /**
   * @openapi
   * /v1/nfts/{contract}:
   *   get:
   *     summary: Get NFT info
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:contract', validator(schema.item), contract.item);

  /**
   * @openapi
   * /v1/nfts/{contract}/txns:
   *   get:
   *     summary: Get NFT transactions by pagination
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *       - in: query
   *         name: cursor.query
   *         description: Next page cursor, takes precedence over 'page' if provided
   *         schema:
   *           type: string
   *           minLength: 36
   *           maxLength: 36
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:contract/txns', validator(schema.nftTxns), contract.txns);

  /**
   * @openapi
   * /v1/nfts/{contract}/txns/count:
   *   get:
   *     summary: Get estimated NFT transaction count
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/txns/count',
    validator(schema.nftTxnsCount),
    contract.txnsCount,
  );

  /**
   * @openapi
   * /v1/nfts/{contract}/holders:
   *   get:
   *     summary: Get NFT holders by pagination
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:contract/holders', validator(schema.holders), contract.holders);

  /**
   * @openapi
   * /v1/nfts/{contract}/holders/count:
   *   get:
   *     summary: Get estimated NFT holders count
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/holders/count',
    validator(schema.holdersCount),
    contract.holdersCount,
  );

  /**
   * @openapi
   * /v1/nfts/{contract}/tokens:
   *   get:
   *     summary: Get NFT tokens list by pagination
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *       - in: query
   *         name: token.query
   *         description: Token ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get('/:contract/tokens', validator(schema.tokens), tokens.list);

  /**
   * @openapi
   * /v1/nfts/{contract}/tokens/count:
   *   get:
   *     summary: Get estimated NFT tokens count
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *       - in: query
   *         name: token.query
   *         description: Token ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/tokens/count',
    validator(schema.tokensCount),
    tokens.count,
  );

  /**
   * @openapi
   * /v1/nfts/{contract}/tokens/{token}:
   *   get:
   *     summary: Get NFT token info
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
   *         schema:
   *           type: string
   *         examples:
   *           token:
   *             value: example-token-id
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/tokens/:token',
    validator(schema.tokenItem),
    tokens.item,
  );

  /**
   * @openapi
   * /v1/nfts/{contract}/tokens/{token}/txns:
   *   get:
   *     summary: Get NFT token transactions by pagination
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
   *         schema:
   *           type: string
   *         examples:
   *           token:
   *             value: example-token-id
   *       - in: query
   *         name: cursor.query
   *         description: Next page cursor, takes precedence over 'page' if provided
   *         schema:
   *           type: string
   *           minLength: 36
   *           maxLength: 36
   *       - in: query
   *         name: page
   *         description: Page number
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 200
   *           default: 1
   *       - in: query
   *         name: per_page
   *         description: Number of items per page
   *         schema:
   *           type: number
   *           minimum: 1
   *           maximum: 250
   *           default: 25
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/tokens/:token/txns',
    validator(schema.tokenTxns),
    tokens.txns,
  );

  /**
   * @openapi
   * /v1/nfts/{contract}/tokens/{token}/txns/count:
   *   get:
   *     summary: Get estimated NFT token transactions count
   *     tags:
   *       - NFTs
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *         examples:
   *           contract:
   *             value: example-contract-id
   *       - in: path
   *         name: token
   *         required: true
   *         description: Token ID
   *         schema:
   *           type: string
   *         examples:
   *           token:
   *             value: example-token-id
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:contract/tokens/:token/txns/count',
    validator(schema.tokenTxnsCount),
    tokens.txnsCount,
  );
};

export default routes;
