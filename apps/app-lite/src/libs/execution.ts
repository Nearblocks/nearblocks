import Big from 'big.js';

const UNKNOWN_ERROR = { type: 'unknown' };

const mapNonDelegateRpcAction = (rpcAction: any) => {
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
      beneficiaryId: rpcAction?.DeleteAccount?.beneficiary_id,
    },
    kind: 'deleteAccount',
  };
};
const mapRpcAction = (rpcAction: any) => {
  if (typeof rpcAction === 'object' && 'Delegate' in rpcAction) {
    return {
      args: {
        actions: rpcAction.Delegate.delegate_action.actions.map(
          (subaction: any, index: any) => ({
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
const mapRpcCompilationError = (error: any) => {
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
};
const mapRpcFunctionCallError = (error: any) => {
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
};
const mapRpcNewReceiptValidationError = (error: any) => {
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
};
const mapRpcInvalidAccessKeyError = (error: any) => {
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
    return {
      accountId: error.AccessKeyNotFound.account_id,
      publicKey: error.AccessKeyNotFound.public_key,
      type: 'accessKeyNotFound',
    };
  }
  if ('ReceiverMismatch' in error) {
    return {
      akReceiver: error.ReceiverMismatch.ak_receiver,
      transactionReceiver: error.ReceiverMismatch.tx_receiver,
      type: 'receiverMismatch',
    };
  }
  if ('MethodNameMismatch' in error) {
    return {
      methodName: error.MethodNameMismatch.method_name,
      type: 'methodNameMismatch',
    };
  }
  if ('NotEnoughAllowance' in error) {
    return {
      accountId: error.NotEnoughAllowance.account_id,
      allowance: error.NotEnoughAllowance.allowance,
      cost: error.NotEnoughAllowance.cost,
      publicKey: error.NotEnoughAllowance.public_key,
      type: 'notEnoughAllowance',
    };
  }
  return UNKNOWN_ERROR;
};
const mapRpcReceiptInvalidTxError = (error: any) => {
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
};
const mapRpcReceiptActionError = (error: any) => {
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
};
const mapRpcReceiptError = (error: any) => {
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
};
const mapRpcReceiptStatus = (status: any) => {
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
};
const execution = () => {
  const depositAmount = (actions: any) =>
    actions
      .map((action: any) =>
        'deposit' in action.args ? action.args.deposit : '0',
      )
      .reduce(
        (accumulator: any, deposit: any) =>
          Big(accumulator).plus(deposit).toString(),
        '0',
      );
  const nestReceipts = (idOrHash: any, parsedMap: any) => {
    const parsedElement = parsedMap.get(idOrHash);
    if (!parsedElement) return { id: idOrHash };
    const { receiptIds, ...restOutcome } = parsedElement.outcome;
    return {
      ...parsedElement,
      outcome: {
        ...restOutcome,
        nestedReceipts: receiptIds.map((id: any) =>
          nestReceipts(id, parsedMap),
        ),
      },
    };
  };
  const txnFee = (transactionOutcome: any, receiptsOutcome: any) =>
    receiptsOutcome
      .map((receipt: any) => receipt.outcome.tokens_burnt)
      .reduce(
        (tokenBurnt: any, currentFee: any) =>
          Big(tokenBurnt).plus(currentFee).toString(),
        transactionOutcome.outcome.tokens_burnt,
      );
  const parseReceipt = (receipt: any, outcome: any, transaction: any) => {
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
  const parseOutcome = (outcome: any, blocksMap: any) => {
    return {
      block: blocksMap.get(outcome.block_hash),
      gasBurnt: outcome.outcome.gas_burnt,
      logs: outcome.outcome.logs,
      receiptIds: outcome.outcome.receipt_ids,
      status: mapRpcReceiptStatus(outcome.outcome.status),
      tokensBurnt: outcome.outcome.tokens_burnt,
    };
  };
  return { depositAmount, nestReceipts, parseOutcome, parseReceipt, txnFee };
};
export default execution;
