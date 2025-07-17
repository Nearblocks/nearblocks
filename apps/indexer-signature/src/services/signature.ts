import { ExecutionOutcomeWithReceipt, Message } from 'nb-blocks-minio';
import { retry } from 'nb-utils';

import config from '#config';
import { hasScheme, isEd25519, isFunctionCallAction } from '#libs/guards';
import { db } from '#libs/knex';
import { decodeArgs, toRSV } from '#libs/utils';
import { MPCSignature, MSReceipt, MSSignature, Sign } from '#types/types';

const batchSize = config.insertLimit;
const signers = ['v1.signer', 'v1.signer-prod.testnet'];

export const storeSignature = async (message: Message) => {
  const receipts: MSReceipt[] = [];
  const signatures: MSSignature[] = [];

  message.shards.forEach((shard) => {
    const chunk = getChunkExecutions(
      message.block.header.timestampNanosec,
      shard.receiptExecutionOutcomes,
    );

    receipts.push(...chunk.receipts);
    signatures.push(...chunk.signatures);
  });

  const promises = [];
  const receiptsLength = receipts.length;

  for (let index = 0; index < receiptsLength; index++) {
    receipts[index].event_index = index;
  }

  if (receiptsLength) {
    for (let i = 0; i < receiptsLength; i += batchSize) {
      const batch = receipts.slice(i, i + batchSize);

      promises.push(
        retry(async () => {
          await db('multichain_signatures')
            .insert(batch)
            .onConflict(['receipt_id', 'block_timestamp', 'event_index'])
            .ignore();
        }),
      );
    }
  }

  if (signatures.length) {
    for (let i = 0; i < signatures.length; i++) {
      const signature = signatures[i];

      promises.push(
        retry(async () => {
          await db('multichain_signatures')
            .update({
              r: signature.r,
              s: signature.s,
              scheme: signature.scheme,
              signature: signature.signature,
              v: signature.v,
            })
            .where('account_id', signature.account_id)
            .where('success_receipt_id', signature.success_receipt_id)
            .where('block_timestamp', '<=', signature.block_timestamp)
            .where(
              'block_timestamp',
              '>=',
              String(BigInt(signature.block_timestamp) - 300_000_000_000n), // 5m in ns
            );
        }),
      );
    }
  }

  await Promise.all(promises);
};

export const getChunkExecutions = (
  blockTimestamp: string,
  executionOutcomes: ExecutionOutcomeWithReceipt[],
) => {
  const receipts: MSReceipt[] = [];
  const signatures: MSSignature[] = [];

  executionOutcomes.forEach((outcome) => {
    if (signers.includes(outcome.executionOutcome.outcome.executorId)) {
      if (
        'SuccessReceiptId' in outcome.executionOutcome.outcome.status &&
        outcome.receipt &&
        outcome.receipt.receipt &&
        'Action' in outcome.receipt.receipt
      ) {
        const signer = outcome.receipt.receipt.Action.signerId;
        const publicKey = outcome.receipt.receipt.Action.signerPublicKey;
        const receiptId = outcome.executionOutcome.id;
        const successReceipt =
          outcome.executionOutcome.outcome.status.SuccessReceiptId;

        outcome.receipt.receipt.Action.actions.forEach((action) => {
          if (
            isFunctionCallAction(action) &&
            action.FunctionCall.methodName === 'sign'
          ) {
            const args = decodeArgs<Sign>(action.FunctionCall.args);

            if (args?.request?.path !== undefined) {
              receipts.push({
                account_id: signer,
                block_timestamp: blockTimestamp,
                event_index: 0, // will be set later
                path: args.request.path,
                public_key: publicKey,
                receipt_id: receiptId,
                success_receipt_id: successReceipt,
              });
              return;
            }
          }
        });
      }

      if (
        'SuccessValue' in outcome.executionOutcome.outcome.status &&
        outcome.receipt &&
        outcome.receipt.receipt &&
        'Action' in outcome.receipt.receipt
      ) {
        const signer = outcome.receipt.receipt.Action.signerId;
        const successReceipt = outcome.executionOutcome.id;
        const signature = decodeArgs(
          outcome.executionOutcome.outcome.status.SuccessValue,
        );

        if (signature && typeof signature === 'object') {
          if (isEd25519(signature)) {
            signatures.push({
              account_id: signer,
              block_timestamp: blockTimestamp,
              r: null,
              s: null,
              scheme: hasScheme(signature) ? signature.scheme : null,
              signature: Buffer.from(signature.signature),
              success_receipt_id: successReceipt,
              v: null,
            });
            return;
          }

          const rsv = toRSV(signature as MPCSignature);

          if (rsv) {
            signatures.push({
              account_id: signer,
              block_timestamp: blockTimestamp,
              r: Buffer.from(rsv.r, 'hex'),
              s: Buffer.from(rsv.s, 'hex'),
              scheme: hasScheme(signature) ? signature.scheme : null,
              signature: null,
              success_receipt_id: successReceipt,
              v: rsv.v,
            });
            return;
          }
        }
      }
    }
  });

  return { receipts, signatures };
};
