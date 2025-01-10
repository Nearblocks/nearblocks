import { createRequire } from 'module';

import { base58 } from '@scure/base';
import { decodeBase64, hexlify, Transaction } from 'ethers';
import { snakeCase, toUpper } from 'lodash-es';
import { types } from 'near-lake-framework';

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
  isFunctionCallAction,
  isStakeAction,
  isTransferAction,
} from '#libs/guards';
import sentry from '#libs/sentry';
import { AccessKeyPermission, ReceiptAction, RlpJson } from '#types/types';

const require = createRequire(import.meta.url);
const json = require('nb-json');

export const jsonParse = (args: string) => json.parse(args);

export const jsonStringify = (args: unknown): string => json.stringify(args);

export const decodeArgs = <T>(args: string): T =>
  json.parse(Buffer.from(args, 'base64').toString());

export const mapExecutionStatus = (
  status: types.ExecutionStatus,
): ExecutionOutcomeStatus => {
  const key = toUpper(
    snakeCase(Object.keys(status)[0]),
  ) as keyof typeof ExecutionOutcomeStatus;

  return ExecutionOutcomeStatus[key];
};

export const mapReceiptKind = (receipt: types.ReceiptEnum): ReceiptKind => {
  const key = toUpper(Object.keys(receipt)[0]) as keyof typeof ReceiptKind;

  return ReceiptKind[key];
};

export const mapActionKind = (action: types.Action): ReceiptAction => {
  let kind = ActionKind.UNKNOWN;
  let args = {};
  let rlpHash = null;
  let method: null | string = null;

  if (
    action === 'CreateAccount' ||
    (action && Object.keys(action)?.[0] === 'CreateAccount')
  ) {
    kind = ActionKind.CREATE_ACCOUNT;
  }

  if (isDeployContractAction(action)) {
    let code = '';

    try {
      code = Buffer.from(action.DeployContract.code, 'base64').toString('hex');
    } catch (error) {
      //
    }

    kind = ActionKind.DEPLOY_CONTRACT;
    args = { code_sha256: code };
  }

  if (isFunctionCallAction(action)) {
    let jsonArgs = null;
    let base64Args = null;

    try {
      jsonArgs = decodeArgs(action.FunctionCall.args);
      method = action.FunctionCall.methodName;
      rlpHash = getRlpHash(action.FunctionCall.methodName, jsonArgs);
    } catch (error) {
      base64Args = action.FunctionCall.args;
    }

    kind = ActionKind.FUNCTION_CALL;
    args = {
      args_base64: base64Args,
      args_json: jsonArgs,
      deposit: action.FunctionCall.deposit,
      gas: action.FunctionCall.gas,
      method_name: action.FunctionCall.methodName,
    };
  }

  if (isTransferAction(action)) {
    kind = ActionKind.TRANSFER;
    args = { deposit: action.Transfer.deposit };
  }

  if (isStakeAction(action)) {
    kind = ActionKind.STAKE;
    args = {
      public_key: action.Stake.publicKey,
      stake: action.Stake.stake,
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

    kind = ActionKind.ADD_KEY;
    args = {
      access_key: {
        nonce: 0,
        permission,
      },
      public_key: action.AddKey.publicKey,
    };
  }

  if (isDeleteKeyAction(action)) {
    kind = ActionKind.DELETE_KEY;
    args = {
      public_key: action.DeleteKey.publicKey,
    };
  }

  if (isDeleteAccountAction(action)) {
    kind = ActionKind.DELETE_ACCOUNT;
    args = {
      beneficiary_id: action.DeleteAccount.beneficiaryId,
    };
  }

  if (isDelegateAction(action)) {
    const delegateAction = action.Delegate.delegateAction;
    args = {
      max_block_height: delegateAction.maxBlockHeight,
      nonce: delegateAction.nonce,
      public_key: delegateAction.publicKey,
      receiver_id: delegateAction.receiverId,
      sender_id: delegateAction.senderId,
      signature: action.signature,
    };
    kind = ActionKind.DELEGATE_ACTION;
  }

  return {
    args: jsonStringify(args),
    kind,
    method,
    rlpHash,
  };
};

export const camelCaseToSnakeCase = (
  value: Exclude<types.Action, 'CreateAccount'>,
) => {
  const newValue: Record<string, unknown> = {};

  for (const key in value) {
    newValue[snakeCase(key)] = value[key as keyof types.Action];
  }

  return newValue;
};

export const publicKeyFromImplicitAccount = (account: string) => {
  try {
    const publicKey = base58.encode(Buffer.from(account, 'hex'));

    return `ed25519:${publicKey}`;
  } catch (error) {
    return null;
  }
};

export const isExecutionSuccess = (status: types.ExecutionStatus) => {
  if ('SuccessValue' in status || 'SuccessReceiptId' in status) {
    return true;
  }

  return false;
};

export const errorHandler = (error: Error) => {
  logger.error(error);
  sentry.captureException(error);
};

export const isNearImplicit = (account: string) =>
  account.length === 64 && /[a-f0-9]{64}/.test(account);

export const isEthImplicit = (account: string) =>
  account.length === 42 &&
  account.startsWith('0x') &&
  /^[a-f0-9]{40}$/.test(account.slice(2));

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

export const getBlockIndex = (shard: number, index: number) => {
  return +`${shard}${String(index).padStart(5, '0')}`;
};

export const retryLogger = (attempt: number, error: unknown) => {
  logger.error(error);
  logger.error({ attempt });
};
