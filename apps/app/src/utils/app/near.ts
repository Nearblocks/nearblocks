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
  OutcomeInfo,
  ParsedReceipt,
  ParseOutcomeInfo,
  ReceiptsInfo,
  ReceiptView,
  RPCCompilationError,
  RPCFunctionCallError,
  RPCInvalidAccessKeyError,
  RPCNewReceiptValidationError,
  RPCTransactionInfo,
  TransactionLog,
  TxExecutionError,
} from '@/utils/types';

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
    : // @ts-ignore
      near?.toFixed(Big(decimal, 10))?.replace(/\.?0+$/, '');

  return formattedValue;
}
export const txnMethod = (
  actions: { action: string; method: string }[],
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

  const outcomes = txn?.receipts_outcome || [];

  for (let i = 0; i < outcomes.length; i++) {
    const outcome = outcomes[i];
    let logs = outcome?.outcome?.logs || [];

    if (logs.length > 0) {
      const mappedLogs: TransactionLog[] = logs.map((log: string) => ({
        contract: outcome?.outcome?.executor_id || '',
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
    const from = receipt?.predecessor_id;
    const to = receipt?.receiver_id;

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
  receipt: ReceiptsInfo | ReceiptView | undefined,
  outcome: OutcomeInfo,
  transaction: NonDelegateActionView,
) {
  if (!receipt) {
    return {
      actions:
        transaction.actions && transaction.actions.map(mapRpcActionToAction1),
      id: outcome.id,
      predecessorId: transaction.signer_id,
      receiverId: transaction.receiver_id,
    };
  }
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
    const { account_id, public_key } = error.AccessKeyNotFound;
    return {
      accountId: account_id,
      publicKey: public_key,
      type: 'accessKeyNotFound',
    };
  }
  if ('ReceiverMismatch' in error) {
    const { ak_receiver, tx_receiver } = error.ReceiverMismatch;
    return {
      akReceiver: ak_receiver,
      transactionReceiver: tx_receiver,
      type: 'receiverMismatch',
    };
  }
  if ('MethodNameMismatch' in error) {
    const { method_name } = error.MethodNameMismatch;
    return {
      methodName: method_name,
      type: 'methodNameMismatch',
    };
  }
  if ('NotEnoughAllowance' in error) {
    const { account_id, allowance, cost, public_key } =
      error.NotEnoughAllowance;
    return {
      accountId: account_id,
      allowance: allowance,
      cost: cost,
      publicKey: public_key,
      type: 'notEnoughAllowance',
    };
  }

  return UNKNOWN_ERROR;
}

export function mapRpcCompilationError(error: RPCCompilationError) {
  const UNKNOWN_ERROR = { type: 'unknown' };
  if ('CodeDoesNotExist' in error) {
    return {
      accountId: error.CodeDoesNotExist.account_id,
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
      accountId: error.InvalidPredecessorId.account_id,
      type: 'invalidPredecessorId',
    };
  }
  if ('InvalidReceiverId' in error) {
    return {
      accountId: error.InvalidReceiverId.account_id,
      type: 'invalidReceiverId',
    };
  }
  if ('InvalidSignerId' in error) {
    return {
      accountId: error.InvalidSignerId.account_id,
      type: 'invalidSignerId',
    };
  }
  if ('InvalidDataReceiverId' in error) {
    return {
      accountId: error.InvalidDataReceiverId.account_id,
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
        error.NumberInputDataDependenciesExceeded
          .number_of_input_data_dependencies,
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
      receiverId: kind.DelegateActionSenderDoesNotMatchTxReceiver.receiver_id,
      senderId: kind.DelegateActionSenderDoesNotMatchTxReceiver.sender_id,
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
      akNonce: kind.DelegateActionInvalidNonce.ak_nonce,
      delegateNonce: kind.DelegateActionInvalidNonce.delegate_nonce,
      type: 'delegateActionInvalidNonce',
    };
  }
  if ('DelegateActionNonceTooLarge' in kind) {
    return {
      delegateNonce: kind.DelegateActionNonceTooLarge.delegate_nonce,
      type: 'delegateActionNonceTooLarge',
      upperBound: kind.DelegateActionNonceTooLarge.upper_bound,
    };
  }
  if ('AccountAlreadyExists' in kind) {
    return {
      accountId: kind.AccountAlreadyExists.account_id,
      type: 'accountAlreadyExists',
    };
  }
  if ('AccountDoesNotExist' in kind) {
    return {
      accountId: kind.AccountDoesNotExist.account_id,
      type: 'accountDoesNotExist',
    };
  }
  if ('CreateAccountOnlyByRegistrar' in kind) {
    return {
      accountId: kind.CreateAccountOnlyByRegistrar.account_id,
      predecessorId: kind.CreateAccountOnlyByRegistrar.predecessor_id,
      registrarAccountId:
        kind.CreateAccountOnlyByRegistrar.registrar_account_id,
      type: 'createAccountOnlyByRegistrar',
    };
  }
  if ('CreateAccountNotAllowed' in kind) {
    return {
      accountId: kind.CreateAccountNotAllowed.account_id,
      predecessorId: kind.CreateAccountNotAllowed.predecessor_id,
      type: 'createAccountNotAllowed',
    };
  }
  if ('ActorNoPermission' in kind) {
    return {
      accountId: kind.ActorNoPermission.account_id,
      actorId: kind.ActorNoPermission.actor_id,
      type: 'actorNoPermission',
    };
  }
  if ('DeleteKeyDoesNotExist' in kind) {
    return {
      accountId: kind.DeleteKeyDoesNotExist.account_id,
      publicKey: kind.DeleteKeyDoesNotExist.public_key,
      type: 'deleteKeyDoesNotExist',
    };
  }
  if ('AddKeyAlreadyExists' in kind) {
    return {
      accountId: kind.AddKeyAlreadyExists.account_id,
      publicKey: kind.AddKeyAlreadyExists.public_key,
      type: 'addKeyAlreadyExists',
    };
  }
  if ('DeleteAccountStaking' in kind) {
    return {
      accountId: kind.DeleteAccountStaking.account_id,
      type: 'deleteAccountStaking',
    };
  }
  if ('LackBalanceForState' in kind) {
    return {
      accountId: kind.LackBalanceForState.account_id,
      amount: kind.LackBalanceForState.amount,
      type: 'lackBalanceForState',
    };
  }
  if ('TriesToUnstake' in kind) {
    return {
      accountId: kind.TriesToUnstake.account_id,
      type: 'triesToUnstake',
    };
  }
  if ('TriesToStake' in kind) {
    return {
      accountId: kind.TriesToStake.account_id,
      balance: kind.TriesToStake.balance,
      locked: kind.TriesToStake.locked,
      stake: kind.TriesToStake.stake,
      type: 'triesToStake',
    };
  }
  if ('InsufficientStake' in kind) {
    return {
      accountId: kind.InsufficientStake.account_id,
      minimumStake: kind.InsufficientStake.minimum_stake,
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
      accountId: kind.OnlyImplicitAccountCreationAllowed.account_id,
      type: 'onlyImplicitAccountCreationAllowed',
    };
  }
  if ('DeleteAccountWithLargeState' in kind) {
    return {
      accountId: kind.DeleteAccountWithLargeState.account_id,
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
      signerId: error.InvalidSignerId.signer_id,
      type: 'invalidSignerId',
    };
  }
  if ('SignerDoesNotExist' in error) {
    return {
      signerId: error.SignerDoesNotExist.signer_id,
      type: 'signerDoesNotExist',
    };
  }
  if ('InvalidNonce' in error) {
    return {
      akNonce: error.InvalidNonce.ak_nonce,
      transactionNonce: error.InvalidNonce.tx_nonce,
      type: 'invalidNonce',
    };
  }
  if ('NonceTooLarge' in error) {
    return {
      transactionNonce: error.NonceTooLarge.tx_nonce,
      type: 'nonceTooLarge',
      upperBound: error.NonceTooLarge.upper_bound,
    };
  }
  if ('InvalidReceiverId' in error) {
    return {
      receiverId: error.InvalidReceiverId.receiver_id,
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
      signerId: error.NotEnoughBalance.signer_id,
      type: 'notEnoughBalance',
    };
  }
  if ('LackBalanceForState' in error) {
    return {
      amount: error.LackBalanceForState.amount,
      signerId: error.LackBalanceForState.signer_id,
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
