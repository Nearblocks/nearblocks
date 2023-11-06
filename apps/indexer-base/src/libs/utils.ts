import { createRequire } from 'module';

import { base58 } from '@scure/base';
import { snakeCase, toUpper } from 'lodash-es';
import { types } from 'near-lake-framework';

import {
  AccessKeyPermissionKind,
  ActionKind,
  ExecutionOutcomeStatus,
  ReceiptKind,
} from 'nb-types';

import {
  isAccessKeyFunctionCallPermission,
  isAddKeyAction,
  isDeleteAccountAction,
  isDeleteKeyAction,
  isDeployContractAction,
  isFunctionCallAction,
  isStakeAction,
  isTransferAction,
} from '#libs/guards';
import { AccessKeyPermission, ReceiptAction } from '#types/types';

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

  if (action === 'CreateAccount') {
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
    let jsonArgs = {};

    try {
      jsonArgs = decodeArgs(action.FunctionCall.args);
    } catch (error) {
      //
    }

    kind = ActionKind.FUNCTION_CALL;
    args = {
      args_base64: action.FunctionCall.args,
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

  return {
    args: jsonStringify(args),
    kind,
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
