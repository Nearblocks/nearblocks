import {
  Action,
  ExecutionOutcomeWithReceipt,
  Receipt as JReceipt,
} from 'nb-neardata';
import { ActionReceiptAction, Receipt } from 'nb-types';

import { isDelegateAction } from '#libs/guards';
import { mapActionKind, mapReceiptKind } from '#libs/utils';

export const buildOutcomeRows = (
  shardId: number,
  chunkHash: string,
  blockHash: string,
  blockTimestamp: string,
  executionOutcomes: ExecutionOutcomeWithReceipt[],
) => {
  const receipts: Receipt[] = [];
  const actions: ActionReceiptAction[] = [];

  executionOutcomes.forEach((executionOutcome, indexInChunk) => {
    if (
      !executionOutcome.receipt ||
      !('Action' in executionOutcome.receipt.receipt)
    ) {
      return;
    }

    const receiptId = executionOutcome.receipt.receiptId;
    const predecessorId = executionOutcome.receipt.predecessorId;
    const receiverId = executionOutcome.receipt.receiverId;
    const publicKey = executionOutcome.receipt.receipt.Action.signerPublicKey;
    const refundTo = executionOutcome.receipt.receipt.Action.refundTo || null;

    receipts.push(
      getReceiptData(
        executionOutcome.receipt,
        shardId,
        chunkHash,
        blockHash,
        blockTimestamp,
        executionOutcome.txHash,
        indexInChunk,
        publicKey,
        refundTo,
      ),
    );

    let actionIndex = 0;

    executionOutcome.receipt.receipt.Action.actions.forEach((action) => {
      if (isDelegateAction(action)) {
        actions.push(
          getActionReceiptActionData(
            shardId,
            blockTimestamp,
            receiptId,
            indexInChunk,
            actionIndex,
            action,
            predecessorId,
            receiverId,
          ),
        );
        actionIndex += 1;

        action.Delegate.delegateAction.actions.forEach((delegated) => {
          actions.push(
            getActionReceiptActionData(
              shardId,
              blockTimestamp,
              receiptId,
              indexInChunk,
              actionIndex,
              delegated,
              predecessorId,
              receiverId,
            ),
          );
          actionIndex += 1;
        });

        return;
      }

      actions.push(
        getActionReceiptActionData(
          shardId,
          blockTimestamp,
          receiptId,
          indexInChunk,
          actionIndex,
          action,
          predecessorId,
          receiverId,
        ),
      );
      actionIndex += 1;
    });
  });

  return { actions, receipts };
};

const getReceiptData = (
  receipt: JReceipt,
  shardId: number,
  chunkHash: string,
  blockHash: string,
  blockTimestamp: string,
  transactionHash: string,
  indexInChunk: number,
  publicKey: null | string,
  refundTo: null | string,
): Receipt => ({
  included_in_block_hash: blockHash,
  included_in_block_timestamp: blockTimestamp,
  included_in_chunk_hash: chunkHash,
  index_in_chunk: indexInChunk,
  originated_from_transaction_hash: transactionHash,
  predecessor_account_id: receipt.predecessorId,
  public_key: publicKey,
  receipt_id: receipt.receiptId,
  receipt_kind: mapReceiptKind(receipt.receipt),
  receiver_account_id: receipt.receiverId,
  refund_to_account_id: refundTo,
  shard_id: shardId,
});

const getActionReceiptActionData = (
  shardId: number,
  blockTimestamp: string,
  receiptId: string,
  chunkIndex: number,
  actionIndex: number,
  action: Action,
  predecessorId: string,
  receiverId: string,
): ActionReceiptAction => {
  const { args, kind, rlpHash } = mapActionKind(action);

  return {
    action_kind: kind,
    args,
    index_in_action_receipt: actionIndex,
    index_in_chunk: chunkIndex,
    nep518_rlp_hash: rlpHash,
    receipt_id: receiptId,
    receipt_included_in_block_timestamp: blockTimestamp,
    receipt_predecessor_account_id: predecessorId,
    receipt_receiver_account_id: receiverId,
    shard_id: shardId,
  };
};
