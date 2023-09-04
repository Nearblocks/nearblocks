import { createRequire } from 'module';

import dayjs from 'dayjs';
import { base58 } from '@scure/base';
import { types } from 'near-lake-framework';
import { toUpper, snakeCase } from 'lodash-es';

import log from '#libs/log';
import redis from '#libs/redis';
import { AccessKeyPermission, ReceiptAction } from '#ts/types';
import {
  ActionKind,
  ReceiptKind,
  ExecutionOutcomeStatus,
  AccessKeyPermissionKind,
} from '#ts/enums';
import {
  isStakeAction,
  isAddKeyAction,
  isTransferAction,
  isDeleteKeyAction,
  isFunctionCallAction,
  isDeleteAccountAction,
  isDeployContractAction,
  isAccessKeyFunctionCallPermission,
} from '#libs/guards';

const require = createRequire(import.meta.url);
const neon = require('../../neon');

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

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
      method_name: action.FunctionCall.methodName,
      args_json: jsonArgs,
      args_base64: action.FunctionCall.args,
      gas: action.FunctionCall.gas,
      deposit: action.FunctionCall.deposit,
    };
  }

  if (isTransferAction(action)) {
    kind = ActionKind.TRANSFER;
    args = { deposit: action.Transfer.deposit };
  }

  if (isStakeAction(action)) {
    kind = ActionKind.STAKE;
    args = {
      stake: action.Stake.stake,
      public_key: action.Stake.publicKey,
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
        receiver_id: action.AddKey.accessKey.permission.FunctionCall.receiverId,
        method_names:
          action.AddKey.accessKey.permission.FunctionCall.methodNames,
      };
    }

    kind = ActionKind.ADD_KEY;
    args = {
      public_key: action.AddKey.publicKey,
      access_key: {
        nonce: 0,
        permission,
      },
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
    kind,
    args: jsonStringify(args),
  };
};

export const camelCaseToSnakeCase = (
  value: Exclude<types.Action, 'CreateAccount'>,
) => {
  const newValue = {};

  for (const key in value) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (newValue as any)[snakeCase(key)] = value[key as keyof types.Action];
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

export const jsonParse = (args: string) => neon.parse(args);

export const jsonStringify = (args: any): string => neon.stringify(args);

export const decodeArgs = <T>(args: string): T =>
  neon.parse(Buffer.from(args, 'base64').toString());

export const isExecutionSuccess = (status: types.ExecutionStatus) => {
  if ('SuccessValue' in status || 'SuccessReceiptId' in status) {
    return true;
  }

  return false;
};

export const deepFreeze = (obj: any) => {
  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach(function (name) {
    const prop = obj[name];

    if (typeof prop == 'object' && !Object.isFrozen(prop)) {
      deepFreeze(prop);
    }
  });

  return obj;
};

export const jobStat = async (job: string, block: number) => {
  const time = dayjs();
  const stat = await redis.hGetAll(job);

  if (stat?.block && stat?.time) {
    log.warn(
      `${job}: 1000 blocks in ${Math.round(
        time.diff(dayjs.unix(+stat.time), 'seconds'),
      )} seconds`,
    );
  }

  await redis.hSet(job, { block, time: time.unix() });
};
