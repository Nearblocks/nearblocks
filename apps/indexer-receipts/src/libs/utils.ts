import { createRequire } from 'module';

import { decodeBase64, encodeBase58, hexlify, Transaction } from 'ethers';
import { snakeCase, toUpper } from 'lodash-es';

import { Action, ExecutionStatus, ReceiptEnum } from 'nb-blocks-minio';
import { logger } from 'nb-logger';
import {
  AccessKeyPermissionKind,
  ActionKind,
  ExecutionOutcomeStatus,
  ReceiptKind,
} from 'nb-types';

import {
  isAccessKeyFunctionCallPermission,
  isAddKeyAction,
  isDelegateAction,
  isDeleteAccountAction,
  isDeleteKeyAction,
  isDeployContractAction,
  isDeployGlobalContractAction,
  isDeployGlobalContractByAccountIdAction,
  isDeterministicStateInitAction,
  isFunctionCallAction,
  isStakeAction,
  isTransferAction,
  isUseGlobalContractAction,
  isUseGlobalContractByAccountIdAction,
} from '#libs/guards';
import sentry from '#libs/sentry';
import { AccessKeyPermission, ReceiptAction, RlpJson } from '#types/types';

const json = createRequire(import.meta.url)('nb-json');

export const jsonStringify = (args: unknown): string => json.stringify(args);

export const decodeArgs = <T>(args: string): T =>
  json.parse(Buffer.from(args, 'base64').toString());

export const mapExecutionStatus = (
  status: ExecutionStatus,
): ExecutionOutcomeStatus => {
  const key = toUpper(
    snakeCase(Object.keys(status)[0]),
  ) as keyof typeof ExecutionOutcomeStatus;

  return ExecutionOutcomeStatus[key];
};

export const mapReceiptKind = (receipt: ReceiptEnum): ReceiptKind => {
  const key = Object.keys(receipt)[0].toUpperCase() as keyof typeof ReceiptKind;

  return ReceiptKind[key];
};

const getCodeHash = (codeBase64: string) => {
  let code: null | string = null;

  try {
    code = encodeBase58(decodeBase64(codeBase64));
  } catch (error) {
    //
  }

  return code === null ? { code } : { code_hash: code };
};

export const mapActionKind = (action: Action): ReceiptAction => {
  const kind = ActionKind.UNKNOWN;
  const args = {};
  let rlpHash = null;

  if (
    action === 'CreateAccount' ||
    (action && Object.keys(action)?.[0] === 'CreateAccount')
  ) {
    return {
      args: jsonStringify(args),
      kind: ActionKind.CREATE_ACCOUNT,
      rlpHash,
    };
  }

  if (isDeployContractAction(action)) {
    return {
      args: jsonStringify(getCodeHash(action.DeployContract.code)),
      kind: ActionKind.DEPLOY_CONTRACT,
      rlpHash,
    };
  }

  if (isDeployGlobalContractAction(action)) {
    return {
      args: jsonStringify(getCodeHash(action.DeployGlobalContract.code)),
      kind: ActionKind.DEPLOY_GLOBAL_CONTRACT,
      rlpHash,
    };
  }

  if (isDeployGlobalContractByAccountIdAction(action)) {
    return {
      args: jsonStringify(
        getCodeHash(action.DeployGlobalContractByAccountId.code),
      ),
      kind: ActionKind.DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID,
      rlpHash,
    };
  }

  if (isUseGlobalContractAction(action)) {
    return {
      args: jsonStringify({ code_hash: action.UseGlobalContract.codeHash }),
      kind: ActionKind.USE_GLOBAL_CONTRACT,
      rlpHash,
    };
  }

  if (isUseGlobalContractByAccountIdAction(action)) {
    return {
      args: jsonStringify({
        account_id: action.UseGlobalContractByAccountId.accountId,
      }),
      kind: ActionKind.USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID,
      rlpHash,
    };
  }

  if (isFunctionCallAction(action)) {
    let jsonArgs = null;

    try {
      jsonArgs = decodeArgs(action.FunctionCall.args);
      rlpHash = getRlpHash(action.FunctionCall.methodName, jsonArgs);
    } catch (error) {
      //
    }

    return {
      args: jsonStringify({
        args_base64: jsonArgs === null ? action.FunctionCall.args : null,
        args_json: jsonArgs,
        deposit: action.FunctionCall.deposit,
        gas: action.FunctionCall.gas,
        method_name: action.FunctionCall.methodName,
      }),
      kind: ActionKind.FUNCTION_CALL,
      rlpHash,
    };
  }

  if (isTransferAction(action)) {
    return {
      args: jsonStringify({ deposit: action.Transfer.deposit }),
      kind: ActionKind.TRANSFER,
      rlpHash,
    };
  }

  if (isStakeAction(action)) {
    return {
      args: jsonStringify({
        public_key: action.Stake.publicKey,
        stake: action.Stake.stake,
      }),
      kind: ActionKind.STAKE,
      rlpHash,
    };
  }

  if (isAddKeyAction(action)) {
    const permission: AccessKeyPermission = {
      permission_kind: AccessKeyPermissionKind.FULL_ACCESS,
    };

    if (isAccessKeyFunctionCallPermission(action.AddKey.accessKey.permission)) {
      permission.permission_kind = AccessKeyPermissionKind.FUNCTION_CALL;
      permission.permission_details = {
        allowance: action.AddKey.accessKey.permission.FunctionCall.allowance,
        method_names:
          action.AddKey.accessKey.permission.FunctionCall.methodNames,
        receiver_id: action.AddKey.accessKey.permission.FunctionCall.receiverId,
      };
    }

    return {
      args: jsonStringify({
        access_key: {
          nonce: 0,
          permission,
        },
        public_key: action.AddKey.publicKey,
      }),
      kind: ActionKind.ADD_KEY,
      rlpHash,
    };
  }

  if (isDeleteKeyAction(action)) {
    return {
      args: jsonStringify({
        public_key: action.DeleteKey.publicKey,
      }),
      kind: ActionKind.DELETE_KEY,
      rlpHash,
    };
  }

  if (isDeleteAccountAction(action)) {
    return {
      args: jsonStringify({
        beneficiary_id: action.DeleteAccount.beneficiaryId,
      }),
      kind: ActionKind.DELETE_ACCOUNT,
      rlpHash,
    };
  }

  if (isDeterministicStateInitAction(action)) {
    return {
      args: jsonStringify(action.DeterministicStateInit),
      kind: ActionKind.DETERMINISTIC_STATE_INIT,
      rlpHash,
    };
  }

  if (isDelegateAction(action)) {
    const delegateAction = action.Delegate.delegateAction;

    return {
      args: jsonStringify({
        max_block_height: delegateAction.maxBlockHeight,
        nonce: delegateAction.nonce,
        public_key: delegateAction.publicKey,
        receiver_id: delegateAction.receiverId,
        sender_id: delegateAction.senderId,
        signature: action.signature,
      }),
      kind: ActionKind.DELEGATE_ACTION,
      rlpHash,
    };
  }

  return {
    args: jsonStringify(args),
    kind,
    rlpHash,
  };
};

export const errorHandler = (error: Error) => {
  logger.error(error);
  sentry.captureException(error);
};

export const getRlpHash = (method: string, args: unknown) => {
  if (method !== 'rlp_execute') return null;

  try {
    const rlpArgs = (args as RlpJson)?.tx_bytes_b64;

    if (rlpArgs) {
      const decoded = decodeRlp(rlpArgs);

      return decoded.hash;
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const decodeRlp = (args: string) => {
  const base64 = decodeBase64(args);
  const hexString = hexlify(base64);

  return Transaction.from(hexString);
};

export const difference = <T>(arr1: T[], arr2: T[]): T[] => {
  const set2 = new Set(arr2);

  return arr1.filter((item) => !set2.has(item));
};

export const getExecutionResult = (status: ExecutionStatus) => {
  return jsonStringify(Object.values(status)[0]);
};
