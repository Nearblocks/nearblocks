import { ExecutionOutcomeWithReceipt, Message } from 'nb-blocks';
import { Transaction } from 'nb-types';
import { retry } from 'nb-utils';

import config from '#config';
import { isEcdsa, isEddsa, isFunctionCallAction } from '#libs/guards';
import { dbRead, dbWrite } from '#libs/knex';
import { decodeArgs, isExecutionSuccess } from '#libs/utils';
import { MSFinal, MSInitial, MSReceipt, MSSignature, Sign } from '#types/types';

type TxnInfo = {
  block_timestamp: string;
  receipt_id: string;
  transaction_hash: string;
};

const batchSize = config.insertLimit;
const signers = [
  'v1.signer',
  'v1.signer-prod.testnet',
  'v1.signer-dev.testnet',
];

export const storeSignature = async (message: Message) => {
  let chunkReceipt: MSReceipt[] = [];
  let chunkSignatures: MSSignature[] = [];

  message.shards.forEach((shard) => {
    const { receipts, signatures } = getChunkExecutions(
      shard.receiptExecutionOutcomes,
    );

    chunkReceipt = chunkReceipt.concat(receipts);
    chunkSignatures = chunkSignatures.concat(signatures);
  });

  const rReceiptIds = chunkReceipt.map((receipt) => receipt.receipt_id);
  const sReceiptIds = chunkSignatures.map((signature) => signature.receipt_id);

  const [rTxns, sTxns] = await Promise.all([
    dbRead<Pick<Transaction, 'block_timestamp' | 'transaction_hash'>>(
      'receipts as r',
    )
      .join(
        'transactions as t',
        'r.originated_from_transaction_hash',
        't.transaction_hash',
      )
      .select('t.transaction_hash', 't.block_timestamp', 'r.receipt_id')
      .whereIn('receipt_id', rReceiptIds) as Promise<TxnInfo[]>,
    dbRead<Pick<Transaction, 'block_timestamp' | 'transaction_hash'>>(
      'receipts as r',
    )
      .join(
        'transactions as t',
        'r.originated_from_transaction_hash',
        't.transaction_hash',
      )
      .select('t.transaction_hash', 't.block_timestamp', 'r.receipt_id')
      .whereIn('receipt_id', sReceiptIds) as Promise<TxnInfo[]>,
  ]);

  const transactions: MSInitial[] = rTxns.flatMap((txn) => {
    const receipt = chunkReceipt.find(
      (receipt) => receipt.receipt_id === txn.receipt_id,
    );

    if (receipt) {
      return {
        account_id: receipt.account_id,
        block_timestamp: txn.block_timestamp,
        path: receipt.path,
        transaction_hash: txn.transaction_hash,
      };
    }

    return [];
  });

  const signatures: MSFinal[] = sTxns.flatMap((txn) => {
    const receipt = chunkSignatures.find(
      (receipt) => receipt.receipt_id === txn.receipt_id,
    );

    if (receipt) {
      return {
        block_timestamp: txn.block_timestamp,
        r: receipt.r,
        s: receipt.s,
        scheme: receipt.scheme,
        signature: receipt.signature,
        transaction_hash: txn.transaction_hash,
        v: receipt.v,
      };
    }

    return [];
  });

  const promises = [];

  if (transactions.length) {
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await dbWrite('multichain_signatures')
            .insert(batch)
            .onConflict(['transaction_hash', 'block_timestamp'])
            .ignore();
        }),
      );
    }
  }

  if (signatures.length) {
    for (let i = 0; i < signatures.length; i += batchSize) {
      const batch = signatures.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await dbWrite('multichain_signatures')
            .insert(batch)
            .onConflict(['transaction_hash', 'block_timestamp'])
            .merge(['scheme', 'signature', 'r', 's', 'v']);
        }),
      );
    }
  }

  await Promise.all(promises);
};

export const getChunkExecutions = (
  executionOutcomes: ExecutionOutcomeWithReceipt[],
) => {
  const receipts: MSReceipt[] = [];
  const signatures: MSSignature[] = [];

  executionOutcomes.forEach((outcome) => {
    if (signers.includes(outcome.executionOutcome.outcome.executorId)) {
      if (
        isExecutionSuccess(outcome.executionOutcome.outcome.status) &&
        outcome.receipt &&
        outcome.receipt.receipt &&
        'Action' in outcome.receipt.receipt
      ) {
        const account = outcome.receipt.predecessorId;

        outcome.receipt.receipt.Action.actions.forEach((action) => {
          if (
            isFunctionCallAction(action) &&
            action.FunctionCall.methodName === 'sign'
          ) {
            const args = decodeArgs<Sign>(action.FunctionCall.args);

            if (args?.request?.path !== undefined) {
              receipts.push({
                account_id: account,
                path: args.request.path,
                receipt_id: outcome.executionOutcome.id,
              });
              return;
            }
          }
        });
      }

      if ('SuccessValue' in outcome.executionOutcome.outcome.status) {
        const signature = decodeArgs(
          outcome.executionOutcome.outcome.status['SuccessValue'],
        );

        if (isEcdsa(signature)) {
          signatures.push({
            r: Buffer.from(signature.big_r.affine_point.substring(2), 'hex'),
            receipt_id: outcome.executionOutcome.id,
            s: Buffer.from(signature.s.scalar, 'hex'),
            scheme: signature.scheme,
            signature: null,
            v: signature.recovery_id,
          });
          return;
        }

        if (isEddsa(signature)) {
          signatures.push({
            r: null,
            receipt_id: outcome.executionOutcome.id,
            s: null,
            scheme: signature.scheme,
            signature: Buffer.from(signature.signature),
            v: null,
          });
          return;
        }
      }
    }
  });

  return { receipts, signatures };
};
