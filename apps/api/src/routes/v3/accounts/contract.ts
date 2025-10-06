import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/request.js';

import { validate } from '#middlewares/validate';
import contracts from '#services/v3/accounts/contract';

const routes = (route: Router) => {
  /**
   * @openapi
   * /v3/accounts/{account}/contract:
   *   get:
   *     summary: Get contract info
   *     tags:
   *       - V3 / Accounts
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
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
   *     summary: Get contract deployments (first & last)
   *     tags:
   *       - V3 / Accounts
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
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
   *     summary: Get contract abi schema
   *     tags:
   *       - V3 / Accounts
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
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
   *     summary: Get latest action args for method
   *     tags:
   *       - V3 / Accounts
   *     parameters:
   *       - in: path
   *         name: contract
   *         required: true
   *         description: Contract ID
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Success response
   */
  route.get(
    '/:account/contract/:method/action',
    validate(request.action),
    contracts.action,
  );
};

export default routes;
