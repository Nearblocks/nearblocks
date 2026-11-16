import { Router } from 'express';

import request from 'nb-schemas/dist/kitwallet/request.js';

import { bearerAuth } from '#middlewares/passport';
import rateLimiter from '#middlewares/rateLimiter';
import { validate } from '#middlewares/validate';
import service from '#services/v3/kitwallet/index';

const route = Router();

const routes = (app: Router) => {
  app.use('/kitwallet', bearerAuth, rateLimiter, route);

  /**
   * @openapi
   * /v3/kitwallet/stakingPools:
   *   get:
   *     summary: Get all staking pools
   *     description: >-
   *       Kitwallet-compatible endpoint. Returns the account IDs of all known
   *       staking pools as a plain array.
   *     tags:
   *       - Kitwallet
   *     responses:
   *       200:
   *         $ref: '#/components/responses/kitwallet.pools'
   */
  route.get('/stakingPools', service.pools);

  /**
   * @openapi
   * /v3/kitwallet/staking-deposits/{account}:
   *   get:
   *     summary: Get staking deposits for an account
   *     description: >-
   *       Kitwallet-compatible endpoint. Returns the net amount an account has
   *       deposited (deposits minus withdrawals) into each staking pool it has
   *       ever deposited to. Amounts are yoctoNEAR strings.
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/kitwallet.deposits'
   */
  route.get(
    '/staking-deposits/:account',
    validate(request.deposits),
    service.deposits,
  );

  /**
   * @openapi
   * /v3/kitwallet/publicKey/{key}/accounts:
   *   get:
   *     summary: Get accounts by public key
   *     description: >-
   *       Kitwallet-compatible endpoint. Returns the IDs of existing accounts that
   *       currently have the given public key as an access key.
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         description: Public key
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/kitwallet.accounts'
   */
  route.get(
    '/publicKey/:key/accounts',
    validate(request.accounts),
    service.accounts,
  );

  /**
   * @openapi
   * /v3/kitwallet/account/{account}/likelyTokens:
   *   get:
   *     summary: Get likely tokens for an account
   *     description: >-
   *       Kitwallet-compatible endpoint. Returns NEP-141 token contracts the
   *       account has interacted with, as a plain array of contract IDs.
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/kitwallet.tokens'
   */
  route.get(
    '/account/:account/likelyTokens',
    validate(request.tokens),
    service.tokens,
  );

  /**
   * @openapi
   * /v3/kitwallet/account/{account}/likelyTokensFromBlock:
   *   get:
   *     summary: Get likely tokens for an account from block
   *     description: >-
   *       Kitwallet-compatible endpoint. Returns NEP-141 token contracts the
   *       account has interacted with after fromBlockTimestamp, plus
   *       lastBlockTimestamp to pass as fromBlockTimestamp on the next call for
   *       incremental updates.
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: fromBlockTimestamp
   *         description: Only include contracts with activity after this block timestamp (nanoseconds). 0 returns all
   *         schema:
   *           type: string
   *           default: '0'
   *     responses:
   *       200:
   *         $ref: '#/components/responses/kitwallet.tokensFromBlock'
   */
  route.get(
    '/account/:account/likelyTokensFromBlock',
    validate(request.tokensFromBlock),
    service.tokensFromBlock,
  );

  /**
   * @openapi
   * /v3/kitwallet/account/{account}/likelyNFTs:
   *   get:
   *     summary: Get likely NFTs for an account
   *     description: >-
   *       Kitwallet-compatible endpoint. Returns NEP-171 NFT contracts the account
   *       has interacted with, as a plain array of contract IDs.
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/kitwallet.nfts'
   */
  route.get(
    '/account/:account/likelyNFTs',
    validate(request.tokens),
    service.nfts,
  );

  /**
   * @openapi
   * /v3/kitwallet/account/{account}/likelyNFTsFromBlock:
   *   get:
   *     summary: Get likely NFTs for an account from block
   *     description: >-
   *       Kitwallet-compatible endpoint. Returns NEP-171 NFT contracts the account
   *       has interacted with after fromBlockTimestamp, plus lastBlockTimestamp to
   *       pass as fromBlockTimestamp on the next call for incremental updates.
   *     tags:
   *       - Kitwallet
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Account ID
   *         schema:
   *           type: string
   *       - in: query
   *         name: fromBlockTimestamp
   *         description: Only include contracts with activity after this block timestamp (nanoseconds). 0 returns all
   *         schema:
   *           type: string
   *           default: '0'
   *     responses:
   *       200:
   *         $ref: '#/components/responses/kitwallet.nftsFromBlock'
   */
  route.get(
    '/account/:account/likelyNFTsFromBlock',
    validate(request.tokensFromBlock),
    service.nftsFromBlock,
  );
};

export default routes;
