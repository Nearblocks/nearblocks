import Big from 'big.js';

import {
  ActionError,
  ActionType,
  ExecutionStatusView,
  FailedToFindReceipt,
  InvalidTxError,
  NestedReceiptWithOutcome,
  NonDelegateAction,
  NonDelegateActionView,
  Obj,
  ParsedReceipt,
  ParseOutcomeInfo,
  RPCCompilationError,
  RPCFunctionCallError,
  RPCInvalidAccessKeyError,
  RPCNewReceiptValidationError,
  RPCTransactionInfo,
  TransactionLog,
  TxExecutionError,
} from '@/utils/types';
import { RpcTransactionResponse } from '@near-js/jsonrpc-types';
import { ActionKind } from 'nb-types';

export function localFormat(number: string) {
  const bigNumber = Big(number);
  const formattedNumber = bigNumber
    .toFixed(5)
    .replace(/(\d)(?=(\d{3})+\.)/g, '$1,'); // Add commas before the decimal point
  return formattedNumber.replace(/\.?0*$/, ''); // Remove trailing zeros and the dot
}
export function dollarFormat(number: string) {
  const bigNumber = new Big(number);

  // Format to two decimal places without thousands separator
  const formattedNumber = bigNumber.toFixed(2);

  // Add comma as a thousands separator
  const parts = formattedNumber.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const dollarFormattedNumber = `${parts.join('.')}`;

  return dollarFormattedNumber;
}
export function yoctoToNear(yocto: string, format: boolean) {
  const YOCTO_PER_NEAR = Big(10).pow(24).toString();

  const near = Big(yocto).div(YOCTO_PER_NEAR).toString();

  return format ? localFormat(near) : near;
}
export function gasPrice(yacto: string) {
  const near = Big(yoctoToNear(yacto, false)).mul(Big(10).pow(12)).toString();

  return `${localFormat(near)} Ⓝ / Tgas`;
}

export function encodeArgs(args: object) {
  if (!args || typeof args === 'undefined') return '';

  return Buffer.from(JSON.stringify(args)).toString('base64');
}

export function decodeArgs(args: string[]) {
  if (!args || typeof args === 'undefined') return {};
  // @ts-ignore
  return JSON.parse(Buffer.from(args, 'base64').toString());
}

export function tokenAmount(amount: string, decimal: string, format: boolean) {
  if (amount === undefined || amount === null) return 'N/A';
  // @ts-ignore
  const near = Big(amount)?.div(Big(10)?.pow(decimal));

  const formattedValue = format
    ? near?.toFixed(8).replace(/\.?0+$/, '')
    : near?.toFixed(Big(decimal).toNumber())?.replace(/\.?0+$/, '');

  return formattedValue;
}
export const txnMethod = (
  actions: { action: string | ActionKind; method: string | null }[],
  t?: (key: string, p?: any) => string | undefined,
) => {
  const count = actions?.length || 0;

  if (!count) return t ? t('unknownType') || 'Unknown' : 'Unknown';
  if (count > 1)
    return t ? t('batchTxns') || 'Batch Transaction' : 'Batch Transaction';

  const action = actions[0];

  if (action.action === 'FUNCTION_CALL') {
    return action.method;
  }

  return action.action;
};

export function price(amount: string, decimal: string, price: string) {
  // @ts-ignore
  const nearAmount = Big(amount).div(Big(10).pow(decimal));
  return dollarFormat(nearAmount.mul(Big(price || 0)).toString());
}

export function tokenPercentage(
  supply: string,
  amount: string,
  decimal: string,
) {
  // @ts-ignore
  const nearAmount = Big(amount).div(Big(10).pow(decimal));
  const nearSupply = Big(supply);

  return nearAmount.div(nearSupply).mul(Big(100)).toFixed(2);
}

export function txnLogs(txn: RPCTransactionInfo): TransactionLog[] {
  let txLogs: TransactionLog[] = [];

  const outcomes = txn?.receiptsOutcome || [];

  for (let i = 0; i < outcomes.length; i++) {
    const outcome = outcomes[i];
    let logs = outcome?.outcome?.logs || [];

    if (logs.length > 0) {
      const mappedLogs: TransactionLog[] = logs.map((log: string) => ({
        contract: outcome?.outcome?.executorId || '',
        logs: log,
      }));
      txLogs = [...txLogs, ...mappedLogs];
    }
  }
  return txLogs;
}

export function mapRpcActionToAction(action: ActionType | string) {
  if (action === 'CreateAccount') {
    return {
      action_kind: 'CreateAccount',
      args: {},
    };
  }

  if (typeof action === 'object') {
    const kind = action && Object.keys(action)[0];

    return {
      action_kind: kind,
      args: action[kind],
    };
  }

  return null;
}

export function txnActions(txn: RPCTransactionInfo) {
  const txActions = [];
  const receipts = txn?.receipts || [];

  for (let i = 0; i < receipts.length; i++) {
    const receipt = receipts[i];
    const from = receipt?.predecessorId;
    const to = receipt?.receiverId;

    if (from === 'system') continue;

    if (Array.isArray(receipt?.receipt)) {
      const actions = receipt.receipt;

      for (let j = 0; j < actions.length; j++) {
        const action = actions[j];

        txActions.push({ from, to, ...action });
      }
    } else {
      const actions = receipt?.receipt?.Action?.actions || [];

      for (let j = 0; j < actions.length; j++) {
        const action = mapRpcActionToAction(actions[j]);

        txActions.push({ from, to, ...action });
      }
    }
  }

  return txActions;
}

export function valueFromObj(obj: Obj): string | undefined {
  const keys = obj && Object.keys(obj);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = obj[key];

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      const nestedValue = valueFromObj(value as Obj);
      if (nestedValue) {
        return nestedValue;
      }
    }
  }

  return undefined;
}

export function txnErrorMessage(txn: RPCTransactionInfo) {
  const kind = txn?.status?.Failure?.ActionError?.kind;

  if (typeof kind === 'string') return kind;
  if (typeof kind === 'object') {
    return valueFromObj(kind);
  }

  return null;
}

export function collectNestedReceiptWithOutcomeOld(
  idOrHash: string,
  parsedMap: Map<string, ParsedReceipt>,
): FailedToFindReceipt | NestedReceiptWithOutcome {
  const parsedElement = parsedMap && parsedMap.get(idOrHash);
  if (!parsedElement) {
    return { id: idOrHash };
  }
  const { receiptIds, ...restOutcome } = parsedElement.outcome;
  return {
    ...parsedElement,
    outcome: {
      ...restOutcome,
      nestedReceipts: receiptIds.map((id: any | ParsedReceipt) =>
        collectNestedReceiptWithOutcomeOld(id, parsedMap),
      ),
    },
  };
}

export function parseReceipt(
  receiptData: any,
  outcome: RpcTransactionResponse['receiptsOutcome'][number],
  transaction: RpcTransactionResponse['transaction'],
) {
  if (!receiptData) {
    return {
      actions:
        transaction.actions && transaction.actions.map(mapRpcActionToAction1),
      id: outcome.id,
      predecessorId: transaction.signerId,
      receiverId: transaction.receiverId,
    };
  }
  const receipt = receiptData;

  return {
    actions:
      'Action' in receipt.receipt
        ? receipt.receipt.Action.actions &&
          receipt.receipt.Action.actions.map(mapRpcActionToAction1)
        : [],
    id: receipt.receipt_id,
    predecessorId: receipt.predecessor_id,
    receiverId: receipt.receiver_id,
  };
}

export function mapNonDelegateRpcActionToAction(
  rpcAction: NonDelegateActionView,
): NonDelegateAction {
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
          nonce: rpcAction.AddKey.accessKey.nonce,
          permission:
            rpcAction.AddKey.accessKey.permission === 'FullAccess'
              ? {
                  type: 'fullAccess',
                }
              : {
                  contractId:
                    rpcAction.AddKey.accessKey.permission.FunctionCall
                      .receiver_id,
                  methodNames:
                    rpcAction.AddKey.accessKey.permission.FunctionCall
                      .methodName,
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
  return {
    args: {
      beneficiaryId: rpcAction.DeleteAccount.beneficiary_id,
    },
    kind: 'deleteAccount',
  };
}

export function mapRpcInvalidAccessKeyError(error: RPCInvalidAccessKeyError) {
  const UNKNOWN_ERROR = { type: 'unknown' };

  if (error === 'DepositWithFunctionCall') {
    return {
      type: 'depositWithFunctionCall',
    };
  }
  if (error === 'RequiresFullAccess') {
    return {
      type: 'requiresFullAccess',
    };
  }
  if ('AccessKeyNotFound' in error) {
    const { accountId, publicKey } = error.AccessKeyNotFound;
    return {
      accountId: accountId,
      publicKey: publicKey,
      type: 'accessKeyNotFound',
    };
  }
  if ('ReceiverMismatch' in error) {
    const { akReceiver, txReceiver } = error.ReceiverMismatch;
    return {
      akReceiver: akReceiver,
      transactionReceiver: txReceiver,
      type: 'receiverMismatch',
    };
  }
  if ('MethodNameMismatch' in error) {
    const { methodName } = error.MethodNameMismatch;
    return {
      methodName: methodName,
      type: 'methodNameMismatch',
    };
  }
  if ('NotEnoughAllowance' in error) {
    const { accountId, allowance, cost, publicKey } = error.NotEnoughAllowance;
    return {
      accountId: accountId,
      allowance: allowance,
      cost: cost,
      publicKey: publicKey,
      type: 'notEnoughAllowance',
    };
  }

  return UNKNOWN_ERROR;
}

export function mapRpcCompilationError(error: RPCCompilationError) {
  const UNKNOWN_ERROR = { type: 'unknown' };
  if ('CodeDoesNotExist' in error) {
    return {
      accountId: error.CodeDoesNotExist.accountId,
      type: 'codeDoesNotExist',
    };
  }
  if ('PrepareError' in error) {
    return {
      type: 'prepareError',
    };
  }
  if ('WasmerCompileError' in error) {
    return {
      msg: error.WasmerCompileError.msg,
      type: 'wasmerCompileError',
    };
  }
  if ('UnsupportedCompiler' in error) {
    return {
      msg: error.UnsupportedCompiler.msg,
      type: 'unsupportedCompiler',
    };
  }
  return UNKNOWN_ERROR;
}

export function mapRpcFunctionCallError(error: RPCFunctionCallError) {
  const UNKNOWN_ERROR = { type: 'unknown' };
  if ('CompilationError' in error) {
    return {
      error: mapRpcCompilationError(error.CompilationError),
      type: 'compilationError',
    };
  }
  if ('LinkError' in error) {
    return {
      msg: error.LinkError.msg,
      type: 'linkError',
    };
  }
  if ('MethodResolveError' in error) {
    return {
      type: 'methodResolveError',
    };
  }
  if ('WasmTrap' in error) {
    return {
      type: 'wasmTrap',
    };
  }
  if ('WasmUnknownError' in error) {
    return {
      type: 'wasmUnknownError',
    };
  }
  if ('HostError' in error) {
    return {
      type: 'hostError',
    };
  }
  if ('_EVMError' in error) {
    return {
      type: 'evmError',
    };
  }
  if ('ExecutionError' in error) {
    return {
      error: error.ExecutionError,
      type: 'executionError',
    };
  }
  return UNKNOWN_ERROR;
}

export function mapRpcNewReceiptValidationError(
  error: RPCNewReceiptValidationError,
) {
  const UNKNOWN_ERROR = { type: 'unknown' };
  if ('InvalidPredecessorId' in error) {
    return {
      accountId: error.InvalidPredecessorId.accountId,
      type: 'invalidPredecessorId',
    };
  }
  if ('InvalidReceiverId' in error) {
    return {
      accountId: error.InvalidReceiverId.accountId,
      type: 'invalidReceiverId',
    };
  }
  if ('InvalidSignerId' in error) {
    return {
      accountId: error.InvalidSignerId.accountId,
      type: 'invalidSignerId',
    };
  }
  if ('InvalidDataReceiverId' in error) {
    return {
      accountId: error.InvalidDataReceiverId.accountId,
      type: 'invalidDataReceiverId',
    };
  }
  if ('ReturnedValueLengthExceeded' in error) {
    return {
      length: error.ReturnedValueLengthExceeded.length,
      limit: error.ReturnedValueLengthExceeded.limit,
      type: 'returnedValueLengthExceeded',
    };
  }
  if ('NumberInputDataDependenciesExceeded' in error) {
    return {
      limit: error.NumberInputDataDependenciesExceeded.limit,
      numberOfInputDataDependencies:
        error.NumberInputDataDependenciesExceeded.numberOfInputDataDependencies,
      type: 'numberInputDataDependenciesExceeded',
    };
  }
  if ('ActionsValidation' in error) {
    return {
      type: 'actionsValidation',
    };
  }
  return UNKNOWN_ERROR;
}

export function mapRpcReceiptActionError(error: ActionError) {
  const UNKNOWN_ERROR = { type: 'unknown' };
  const { kind } = error;
  if (kind === 'DelegateActionExpired') {
    return {
      type: 'delegateActionExpired',
    };
  }
  if (kind === 'DelegateActionInvalidSignature') {
    return {
      type: 'delegateActionInvalidSignature',
    };
  }
  if ('DelegateActionSenderDoesNotMatchTxReceiver' in kind) {
    return {
      receiverId: kind.DelegateActionSenderDoesNotMatchTxReceiver.receiverId,
      senderId: kind.DelegateActionSenderDoesNotMatchTxReceiver.senderId,
      type: 'delegateActionSenderDoesNotMatchTxReceiver',
    };
  }
  if ('DelegateActionAccessKeyError' in kind) {
    return {
      error: mapRpcInvalidAccessKeyError(kind.DelegateActionAccessKeyError),
      type: 'delegateActionAccessKeyError',
    };
  }
  if ('DelegateActionInvalidNonce' in kind) {
    return {
      akNonce: kind.DelegateActionInvalidNonce.akNonce,
      delegateNonce: kind.DelegateActionInvalidNonce.delegateNonce,
      type: 'delegateActionInvalidNonce',
    };
  }
  if ('DelegateActionNonceTooLarge' in kind) {
    return {
      delegateNonce: kind.DelegateActionNonceTooLarge.delegateNonce,
      type: 'delegateActionNonceTooLarge',
      upperBound: kind.DelegateActionNonceTooLarge.upperBound,
    };
  }
  if ('AccountAlreadyExists' in kind) {
    return {
      accountId: kind.AccountAlreadyExists.accountId,
      type: 'accountAlreadyExists',
    };
  }
  if ('AccountDoesNotExist' in kind) {
    return {
      accountId: kind.AccountDoesNotExist.accountId,
      type: 'accountDoesNotExist',
    };
  }
  if ('CreateAccountOnlyByRegistrar' in kind) {
    return {
      accountId: kind.CreateAccountOnlyByRegistrar.accountId,
      predecessorId: kind.CreateAccountOnlyByRegistrar.predecessorId,
      registrarAccountId: kind.CreateAccountOnlyByRegistrar.registrarAccountId,
      type: 'createAccountOnlyByRegistrar',
    };
  }
  if ('CreateAccountNotAllowed' in kind) {
    return {
      accountId: kind.CreateAccountNotAllowed.accountId,
      predecessorId: kind.CreateAccountNotAllowed.predecessorId,
      type: 'createAccountNotAllowed',
    };
  }
  if ('ActorNoPermission' in kind) {
    return {
      accountId: kind.ActorNoPermission.accountId,
      actorId: kind.ActorNoPermission.actorId,
      type: 'actorNoPermission',
    };
  }
  if ('DeleteKeyDoesNotExist' in kind) {
    return {
      accountId: kind.DeleteKeyDoesNotExist.accountId,
      publicKey: kind.DeleteKeyDoesNotExist.publicKey,
      type: 'deleteKeyDoesNotExist',
    };
  }
  if ('AddKeyAlreadyExists' in kind) {
    return {
      accountId: kind.AddKeyAlreadyExists.accountId,
      publicKey: kind.AddKeyAlreadyExists.publicKey,
      type: 'addKeyAlreadyExists',
    };
  }
  if ('DeleteAccountStaking' in kind) {
    return {
      accountId: kind.DeleteAccountStaking.accountId,
      type: 'deleteAccountStaking',
    };
  }
  if ('LackBalanceForState' in kind) {
    return {
      accountId: kind.LackBalanceForState.accountId,
      amount: kind.LackBalanceForState.amount,
      type: 'lackBalanceForState',
    };
  }
  if ('TriesToUnstake' in kind) {
    return {
      accountId: kind.TriesToUnstake.accountId,
      type: 'triesToUnstake',
    };
  }
  if ('TriesToStake' in kind) {
    return {
      accountId: kind.TriesToStake.accountId,
      balance: kind.TriesToStake.balance,
      locked: kind.TriesToStake.locked,
      stake: kind.TriesToStake.stake,
      type: 'triesToStake',
    };
  }
  if ('InsufficientStake' in kind) {
    return {
      accountId: kind.InsufficientStake.accountId,
      minimumStake: kind.InsufficientStake.minimumStake,
      stake: kind.InsufficientStake.stake,
      type: 'insufficientStake',
    };
  }
  if ('FunctionCallError' in kind) {
    return {
      error: mapRpcFunctionCallError(kind.FunctionCallError),
      type: 'functionCallError',
    };
  }
  if ('NewReceiptValidationError' in kind) {
    return {
      error: mapRpcNewReceiptValidationError(kind.NewReceiptValidationError),
      type: 'newReceiptValidationError',
    };
  }
  if ('OnlyImplicitAccountCreationAllowed' in kind) {
    return {
      accountId: kind.OnlyImplicitAccountCreationAllowed.accountId,
      type: 'onlyImplicitAccountCreationAllowed',
    };
  }
  if ('DeleteAccountWithLargeState' in kind) {
    return {
      accountId: kind.DeleteAccountWithLargeState.accountId,
      type: 'deleteAccountWithLargeState',
    };
  }
  return UNKNOWN_ERROR;
}

export function mapRpcReceiptInvalidTxError(error: InvalidTxError) {
  const UNKNOWN_ERROR = { type: 'unknown' };
  if ('InvalidAccessKeyError' in error) {
    return {
      error: mapRpcInvalidAccessKeyError(error.InvalidAccessKeyError),
      type: 'invalidAccessKeyError',
    };
  }
  if ('InvalidSignerId' in error) {
    return {
      signerId: error.InvalidSignerId.signerId,
      type: 'invalidSignerId',
    };
  }
  if ('SignerDoesNotExist' in error) {
    return {
      signerId: error.SignerDoesNotExist.signerId,
      type: 'signerDoesNotExist',
    };
  }
  if ('InvalidNonce' in error) {
    return {
      akNonce: error.InvalidNonce.akNonce,
      transactionNonce: error.InvalidNonce.txNonce,
      type: 'invalidNonce',
    };
  }
  if ('NonceTooLarge' in error) {
    return {
      transactionNonce: error.NonceTooLarge.txNonce,
      type: 'nonceTooLarge',
      upperBound: error.NonceTooLarge.upperBound,
    };
  }
  if ('InvalidReceiverId' in error) {
    return {
      receiverId: error.InvalidReceiverId.receiverId,
      type: 'invalidReceiverId',
    };
  }
  if ('InvalidSignature' in error) {
    return {
      type: 'invalidSignature',
    };
  }
  if ('NotEnoughBalance' in error) {
    return {
      balance: error.NotEnoughBalance.balance,
      cost: error.NotEnoughBalance.cost,
      signerId: error.NotEnoughBalance.signerId,
      type: 'notEnoughBalance',
    };
  }
  if ('LackBalanceForState' in error) {
    return {
      amount: error.LackBalanceForState.amount,
      signerId: error.LackBalanceForState.signerId,
      type: 'lackBalanceForState',
    };
  }
  if ('CostOverflow' in error) {
    return {
      type: 'costOverflow',
    };
  }
  if ('InvalidChain' in error) {
    return {
      type: 'invalidChain',
    };
  }
  if ('Expired' in error) {
    return {
      type: 'expired',
    };
  }
  if ('ActionsValidation' in error) {
    return {
      type: 'actionsValidation',
    };
  }
  if ('TransactionSizeExceeded' in error) {
    return {
      limit: error.TransactionSizeExceeded.limit,
      size: error.TransactionSizeExceeded.size,
      type: 'transactionSizeExceeded',
    };
  }
  return UNKNOWN_ERROR;
}

export function mapRpcReceiptError(error: TxExecutionError) {
  let UNKNOWN_ERROR = { type: 'unknown' };
  if ('ActionError' in error) {
    return {
      error: mapRpcReceiptActionError(error.ActionError),
      type: 'action',
    };
  }
  if ('InvalidTxError' in error) {
    return {
      error: mapRpcReceiptInvalidTxError(error.InvalidTxError),
      type: 'transaction',
    };
  }
  return UNKNOWN_ERROR;
}

export function mapRpcReceiptStatus(status: ExecutionStatusView) {
  if ('SuccessValue' in status) {
    return { type: 'successValue', value: status.SuccessValue };
  }
  if ('SuccessReceiptId' in status) {
    return { receiptId: status.SuccessReceiptId, type: 'successReceiptId' };
  }
  if ('Failure' in status) {
    return { error: mapRpcReceiptError(status.Failure), type: 'failure' };
  }
  return { type: 'unknown' };
}

export function mapRpcActionToAction1(rpcAction: NonDelegateActionView) {
  if (typeof rpcAction === 'object' && 'Delegate' in rpcAction) {
    return {
      args: {
        actions: rpcAction.Delegate.delegate_action.actions.map(
          (subaction: NonDelegateActionView, index: number) => ({
            ...mapNonDelegateRpcActionToAction(subaction),
            delegateIndex: index,
          }),
        ),
        receiverId: rpcAction.Delegate.delegate_action.receiver_id,
        senderId: rpcAction.Delegate.delegate_action.sender_id,
      },
      kind: 'delegateAction',
    };
  }
  return mapNonDelegateRpcActionToAction(rpcAction);
}

export function parseOutcomeOld(outcome: ParseOutcomeInfo) {
  return {
    blockHash: outcome.block_hash,
    gasBurnt: outcome.outcome.gas_burnt,
    logs: outcome.outcome.logs,
    receiptIds: outcome.outcome.receipt_ids,
    status: mapRpcReceiptStatus(outcome.outcome.status),
    tokensBurnt: outcome.outcome.tokens_burnt,
  };
}

export function parseEventLogs(event: TransactionLog): {} | any {
  let parsedEvent: {} | any = {};

  try {
    if (event?.logs?.startsWith('EVENT_JSON:')) {
      parsedEvent = JSON.parse(event?.logs?.replace('EVENT_JSON:', ''));
    }
  } catch (error) {
    console.error('Failed to parse event logs:', error);
  }

  return parsedEvent;
}

export function displayGlobalContractArgs(args: any) {
  if (!args || typeof args === 'undefined') {
    return 'The arguments are empty';
  }

  if (typeof args === 'string') {
    return args;
  } else if (typeof args === 'object') {
    return JSON.stringify(args, null, 2);
  }

  return String(args);
}
