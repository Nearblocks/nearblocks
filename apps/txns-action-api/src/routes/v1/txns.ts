import { Router } from 'express';

import schema from '../../libs/schema/v1/txns';
import validator from '../../middlewares/validator';
import txns from '../../services/v1/txns';

const route = Router();

const routes = (app: Router) => {
  app.use('/txn-action', route);

  /**
   * @openapi
   * /v1/txn-action/{hash}:
   *   post:
   *     summary: Get full parsed NEAR transaction actions
   *     tags:
   *       - Transactions Actions
   *     parameters:
   *       - in: path
   *         name: hash
   *         required: true
   *         description: NEAR transaction hash (base58-encoded)
   *         schema:
   *           type: string
   *     description: >
   *       Parses a raw NEAR transaction and returns structured action data.
   *       Use the response from https://api.nearblocks.io/v1/txns/value,example-txn-hash/full for the `transaction` payload.
   *       Requires the following environment variables to be configured:
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - transaction
   *             properties:
   *               transaction:
   *                 type: object
   *                 required:
   *                   - transaction_hash
   *                   - signer_account_id
   *                   - receiver_account_id
   *                   - block
   *                   - actions
   *                 properties:
   *                   transaction_hash:
   *                     type: string
   *                     description: Base58-encoded transaction hash
   *                   signer_account_id:
   *                     type: string
   *                     description: Signer account ID
   *                   receiver_account_id:
   *                     type: string
   *                     description: Receiver (contract) account ID
   *                   block:
   *                     type: object
   *                     properties:
   *                       block_hash:
   *                         type: string
   *                         description: Base58-encoded block hash
   *                       block_height:
   *                         type: integer
   *                         description: Block height (uint64)
   *                       block_timestamp:
   *                         type: string
   *                         description: Nanosecond timestamp as string
   *                   actions:
   *                     type: array
   *                     items:
   *                       type: object
   *                       properties:
   *                         action:
   *                           type: string
   *                           description: NEAR action type (e.g. FUNCTION_CALL, TRANSFER)
   *                         args:
   *                           type: object
   *                           properties:
   *                             method_name:
   *                               type: string
   *                               description: Method name for FUNCTION_CALL
   *                             args_json:
   *                               type: object
   *                               description: Parsed method arguments (if available)
   *                             args_base64:
   *                               type: string
   *                               description: Base64-encoded method arguments
   *                             deposit:
   *                               type: string
   *                               description: Amount attached to call (yoctoNEAR)
   *                             gas:
   *                               type: string
   *                               description: Gas attached to call (as string)
   *                   outcomes:
   *                     type: object
   *                     properties:
   *                       status_key:
   *                         type: string
   *                       result:
   *                         type: object
   *                       logs:
   *                         type: array
   *                         items:
   *                           type: string
   *                   receipts:
   *                     type: array
   *                     items:
   *                       type: object
   *                       properties:
   *                         receipt_id:
   *                           type: string
   *                         outcome:
   *                           type: object
   *                           properties:
   *                             executor_account_id:
   *                               type: string
   *                             gas_burnt:
   *                               type: string
   *                             tokens_burnt:
   *                               type: string
   *                             logs:
   *                               type: array
   *                               items:
   *                                 type: string
   *                             status:
   *                               type: object
   *                         block:
   *                           type: object
   *                           properties:
   *                             block_hash:
   *                               type: string
   *                             block_height:
   *                               type: integer
   *                             block_timestamp:
   *                               type: string
   *                   outcomes_agg:
   *                     type: object
   *                     properties:
   *                       gas_used:
   *                         type: string
   *                       transaction_fee:
   *                         type: string
   *                   actions_agg:
   *                     type: object
   *                     properties:
   *                       deposit:
   *                         type: string
   *                       gas_attached:
   *                         type: string
   *                   shard_id:
   *                     type: string
   *     responses:
   *       200:
   *         description: Success response
   */

  route.post('/:hash', validator(schema.txns), txns.parsedTxn);
};

export default routes;
