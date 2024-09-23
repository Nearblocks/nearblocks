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
   * GET /v1/nfts
   * @summary Get top nfts by pagination
   * @tags NFTs
   * @param {string} search.query - search keyword
   * @param {number} page.query - json:{"minimum": 1, "maximum": 100, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 50, "default": 50}
   * @param {string} order.query - json:{"enum": ["desc", "asc"], "default": "desc"}
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/', validator(schema.list), nft.list);

  /**
   * GET /v1/nfts/count
   * @summary Get top nfts count
   * @tags NFTs
   * @param {string} search.query - search keyword
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/count', validator(schema.count), nft.count);

  /**
   * GET /v1/nfts/txns
   * @summary Get nft txns by pagination
   * @tags NFTs
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided - json:{"minLength": 36, "maxLength": 36}
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/txns', validator(schema.txns), nft.txns);

  /**
   * GET /v1/nfts/txns/count
   * @summary Get estimated nft txns count
   * @tags NFTs
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/txns/count', validator(schema.txnsCount), nft.txnsCount);

  /**
   * GET /v1/nfts/{contract}
   * @summary Get nft info
   * @tags NFTs
   * @param {string} contract.path.required - contract id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:contract', validator(schema.item), contract.item);

  /**
   * GET /v1/nfts/{contract}/txns
   * @summary Get nft txns by pagination
   * @tags NFTs
   * @param {string} contract.path.required - contract id
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided - json:{"minLength": 36, "maxLength": 36}
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:contract/txns', validator(schema.nftTxns), contract.txns);

  /**
   * GET /v1/nfts/{contract}/txns/count
   * @summary Get estimated nft txns count
   * @tags NFTs
   * @param {string} contract.path.required - contract id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:contract/txns/count',
    validator(schema.nftTxnsCount),
    contract.txnsCount,
  );

  /**
   * GET /v1/nfts/{contract}/holders
   * @summary Get nft holders by pagination
   * @tags NFTs
   * @param {string} contract.path.required - contract id
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:contract/holders', validator(schema.holders), contract.holders);

  /**
   * GET /v1/nfts/{contract}/holders/count
   * @summary Get estimated nft holders count
   * @tags NFTs
   * @param {string} contract.path.required - contract id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:contract/holders/count',
    validator(schema.holdersCount),
    contract.holdersCount,
  );

  /**
   * GET /v1/nfts/{contract}/tokens
   * @summary Get nft tokens list by pagination
   * @tags NFTs
   * @param {string} contract.path.required - contract id
   * @param {string} token.query - token id
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get('/:contract/tokens', validator(schema.tokens), tokens.list);

  /**
   * GET /v1/nfts/{contract}/tokens/count
   * @summary Get estimated nft tokens count
   * @tags NFTs
   * @param {string} contract.path.required - contract id
   * @param {string} token.query - token id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:contract/tokens/count',
    validator(schema.tokensCount),
    tokens.count,
  );

  /**
   * GET /v1/nfts/{contract}/tokens/{token}
   * @summary Get nft token info
   * @tags NFTs
   * @param {string} contract.path.required - contract id
   * @param {string} token.query - token id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:contract/tokens/:token',
    validator(schema.tokenItem),
    tokens.item,
  );

  /**
   * GET /v1/nfts/{contract}/tokens/{token}/txns
   * @summary Get nft token txns by pagination
   * @tags NFTs
   * @param {string} contract.path.required - contract id
   * @param {string} token.query - token id
   * @param {string} cursor.query - next page cursor, takes precedence over 'page' if provided - json:{"minLength": 36, "maxLength": 36}
   * @param {number} page.query - json:{"minimum": 1, "maximum": 200, "default": 1}
   * @param {number} per_page.query - json:{"minimum": 1, "maximum": 250, "default": 25} - Default: 25, each increment of 25 will count towards rate limit. eg. per page 50 will use 2 credits
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:contract/tokens/:token/txns',
    validator(schema.tokenTxns),
    tokens.txns,
  );

  /**
   * GET /v1/nfts/{contract}/tokens/{token}/txns/count
   * @summary Get estimated nft token txns count
   * @tags NFTs
   * @param {string} contract.path.required - contract id
   * @param {string} token.query - token id
   * @return 200 - success response
   * @security BearerAuth
   */
  route.get(
    '/:contract/tokens/:token/txns/count',
    validator(schema.tokenTxnsCount),
    tokens.txnsCount,
  );
};

export default routes;
