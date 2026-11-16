import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/request.js';

import { validate } from '#middlewares/validate';
import contracts from '#services/v3/accounts/contract';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/contract:
   *   get:
   *     summary: Get contract code
   *     description: >-
   *       Returns the contract code currently deployed on the account: base64
   *       Wasm, code hash and, for global contracts, the global account ID or
   *       code hash. Code for global contracts is fetched over RPC and cached
   *       for 5 minutes. `data` is null if no contract is deployed.
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Contract account ID, e.g. `wrap.near`
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.contract'
   */
  route.get(
    '/:account/contract',
    validate(request.contract),
    contracts.contract,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/contract/deployments:
   *   get:
   *     summary: Get contract deployment history
   *     description: >-
   *       Returns the first and the most recent contract deployment (one entry
   *       if they are the same), each with the transaction hash, the deploying
   *       predecessor account and the block. Empty if the account never had a
   *       contract.
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Contract account ID, e.g. `wrap.near`
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.deployments'
   */
  route.get(
    '/:account/contract/deployments',
    validate(request.deployments),
    contracts.deployments,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/contract/schema:
   *   get:
   *     summary: Get contract ABI schema
   *     description: >-
   *       Returns the method names exported by the deployed Wasm and the
   *       contract ABI (`schema`) if the contract embeds one, otherwise null.
   *       The ABI lookup is cached for 5 minutes. `data` is null if the account
   *       has no contract code.
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Contract account ID, e.g. `wrap.near`
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.schema'
   */
  route.get(
    '/:account/contract/schema',
    validate(request.schema),
    contracts.schema,
  );

  /**
   * @openapi
   * /v3/accounts/{account}/contract/{method}/action:
   *   get:
   *     summary: Get latest action args for a contract method
   *     description: >-
   *       Returns the arguments of the most recent function call to `method` on
   *       this contract, e.g. to prefill a call form. `data` is null if no such
   *       call is found.
   *     tags:
   *       - Accounts
   *     parameters:
   *       - in: path
   *         name: account
   *         required: true
   *         description: Contract account ID, e.g. `wrap.near`
   *         schema:
   *           type: string
   *       - in: path
   *         name: method
   *         required: true
   *         description: Contract method name, e.g. `ft_transfer`
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         $ref: '#/components/responses/accounts.action'
   */
  route.get(
    '/:account/contract/:method/action',
    validate(request.action),
    contracts.action,
  );
};

export default routes;
