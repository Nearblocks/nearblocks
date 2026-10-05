import type {
  Action,
  ActionNonDelegateAction,
  ActionView,
  ExecutionOutcomeWithIdView,
  FailedToFindReceipt,
  NestedReceiptWithOutcome,
  NonDelegateActionView,
  ParsedBlock,
  ParsedReceipt,
  ReceiptView,
  SignedTransactionView,
} from '@/types/near';

import { getErrorMessage } from './txn';

const mapNonDelegateRpcAction = (
  rpcAction: NonDelegateActionView,
): ActionNonDelegateAction => {
  if (rpcAction === 'CreateAccount') {
    return {
      args: {},
      kind: 'createAccount',
    };
  }

  if ('DeployContract' in rpcAction) {
    return {
      args: rpcAction.DeployContract,
      kind: 'deployContract',
    };
  }

  if ('FunctionCall' in rpcAction) {
    return {
      args: {
        args: rpcAction.FunctionCall.args,
        deposit: rpcAction.FunctionCall.deposit,
        gas: rpcAction.FunctionCall.gas,
        methodName: rpcAction.FunctionCall.method_name,
      },
      kind: 'functionCall',
    };
  }

  if ('Transfer' in rpcAction) {
    return {
      args: rpcAction.Transfer,
      kind: 'transfer',
    };
  }

  if ('Stake' in rpcAction) {
    return {
      args: {
        publicKey: rpcAction.Stake.public_key,
        stake: rpcAction.Stake.stake,
      },
      kind: 'stake',
    };
  }

  if ('AddKey' in rpcAction) {
    return {
      args: {
        accessKey: {
          nonce: rpcAction.AddKey.access_key.nonce,
          permission:
            rpcAction.AddKey.access_key.permission === 'FullAccess'
              ? {
                  type: 'fullAccess',
                }
              : {
                  contractId:
                    rpcAction.AddKey.access_key.permission.FunctionCall
                      .receiver_id,
                  methodNames:
                    rpcAction.AddKey.access_key.permission.FunctionCall
                      .method_names,
                  type: 'functionCall',
                },
        },
        publicKey: rpcAction.AddKey.public_key,
      },
      kind: 'addKey',
    };
  }

  if ('DeleteKey' in rpcAction) {
    return {
      args: {
        publicKey: rpcAction.DeleteKey.public_key,
      },
      kind: 'deleteKey',
    };
  }

  if ('DeleteAccount' in rpcAction) {
    return {
      args: {
        beneficiaryId: rpcAction.DeleteAccount.beneficiary_id,
      },
      kind: 'deleteAccount',
    };
  }

  return {
    args: {
      name: Object.keys(rpcAction)[0] ?? 'Unknown',
    },
    kind: 'unknown',
  };
};

const mapRpcAction = (rpcAction: ActionView): Action => {
  if (typeof rpcAction === 'object' && 'Delegate' in rpcAction) {
    return {
      args: {
        actions: rpcAction.Delegate.delegate_action.actions.map(
          (subaction, index) => ({
            ...mapNonDelegateRpcAction(subaction),
            delegateIndex: index,
          }),
        ),
        receiverId: rpcAction.Delegate.delegate_action.receiver_id,
        senderId: rpcAction.Delegate.delegate_action.sender_id,
      },
      kind: 'delegateAction',
    };
  }
  return mapNonDelegateRpcAction(rpcAction);
};

export const nestReceipts = (
  idOrHash: string,
  parsedMap: Map<string, ParsedReceipt>,
): FailedToFindReceipt | NestedReceiptWithOutcome => {
  const parsedElement = parsedMap.get(idOrHash)!;

  if (!parsedElement) return { id: idOrHash };

  const { receiptIds, ...restOutcome } = parsedElement.outcome;

  return {
    ...parsedElement,
    outcome: {
      ...restOutcome,
      nestedReceipts: receiptIds.map((id) => nestReceipts(id, parsedMap)),
    },
  };
};

export const parseReceipt = (
  receipt: ReceiptView | undefined,
  outcome: ExecutionOutcomeWithIdView,
  transaction: SignedTransactionView,
): Omit<ParsedReceipt, 'outcome'> => {
  if (!receipt) {
    return {
      actions: transaction.actions.map(mapRpcAction),
      id: outcome.id,
      predecessorId: transaction.signer_id,
      receiverId: transaction.receiver_id,
    };
  }

  return {
    actions:
      'Action' in receipt.receipt
        ? receipt.receipt.Action.actions.map(mapRpcAction)
        : [],
    id: receipt.receipt_id,
    predecessorId: receipt.predecessor_id,
    receiverId: receipt.receiver_id,
  };
};

export const parseOutcome = (
  outcome: ExecutionOutcomeWithIdView,
  blocksMap: Map<string, ParsedBlock>,
): ParsedReceipt['outcome'] => {
  return {
    block: blocksMap.get(outcome.block_hash)!,
    error: getErrorMessage(outcome.outcome.status),
    gasBurnt: outcome.outcome.gas_burnt,
    logs: outcome.outcome.logs,
    receiptIds: outcome.outcome.receipt_ids,
    status: outcome.outcome.status,
    tokensBurnt: outcome.outcome.tokens_burnt,
  };
};
