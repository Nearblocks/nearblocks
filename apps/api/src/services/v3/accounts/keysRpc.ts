import type {
  AccountRpcKey,
  AccountRpcKeyCount,
  AccountRpcKeyCountReq,
  AccountRpcKeysReq,
} from 'nb-schemas';
import request from 'nb-schemas/dist/accounts/keys/rpc/request.js';
import response from 'nb-schemas/dist/accounts/keys/rpc/response.js';
import { AccessKeyPermissionKind } from 'nb-types';

import cursors from '#libs/cursors';
import { getProvider, viewAccessKeys } from '#libs/near';
import redis from '#libs/redis';
import { responseHandler } from '#middlewares/response';
import type { RequestValidator } from '#middlewares/validate';

type RpcAccessKeyPermission =
  | 'FullAccess'
  | {
      FunctionCall: {
        allowance: null | string;
        method_names: string[];
        receiver_id: string;
      };
    };

type RpcAccessKeyInfo = {
  access_key: {
    nonce: number;
    permission: RpcAccessKeyPermission;
  };
  public_key: string;
};

const mapKey = (info: RpcAccessKeyInfo): AccountRpcKey => {
  const { permission } = info.access_key;

  if (permission === 'FullAccess') {
    return {
      nonce: String(info.access_key.nonce),
      permission: null,
      permission_kind: AccessKeyPermissionKind.FULL_ACCESS,
      public_key: info.public_key,
    };
  }

  return {
    nonce: String(info.access_key.nonce),
    permission: {
      allowance: permission.FunctionCall.allowance,
      methodNames: permission.FunctionCall.method_names ?? [],
      receiverId: permission.FunctionCall.receiver_id,
    },
    permission_kind: AccessKeyPermissionKind.FUNCTION_CALL,
    public_key: info.public_key,
  };
};

const list = (account: string): Promise<AccountRpcKey[] | null> =>
  redis.cache<AccountRpcKey[] | null>(
    `v3:keys:rpc:${account}`,
    async () => {
      try {
        const res = (await viewAccessKeys(getProvider(), account)) as {
          keys?: RpcAccessKeyInfo[];
        };

        if (!res?.keys) return null;

        return res.keys
          .map(mapKey)
          .sort((a, b) => (a.public_key < b.public_key ? -1 : 1));
      } catch (error) {
        return null;
      }
    },
    60 * 5, // 5 mins,
  );

const keys = responseHandler(
  response.keys,
  async (req: RequestValidator<AccountRpcKeysReq>) => {
    const account = req.validator.account;
    const limit = req.validator.limit;
    const next = req.validator.next
      ? cursors.decode(request.cursor, req.validator.next)
      : null;
    const prev = req.validator.prev
      ? cursors.decode(request.cursor, req.validator.prev)
      : null;

    const all = await list(account);

    if (!all?.length) return { data: [] };

    let start = 0;

    if (next) {
      start = all.findIndex((key) => key.public_key > next.key);
      if (start < 0) return { data: [] };
    } else if (prev) {
      const idx = all.findIndex((key) => key.public_key >= prev.key);
      start = Math.max(0, (idx < 0 ? all.length : idx) - limit);
    }

    const data = all.slice(start, start + limit);
    const meta: Record<string, string> = {};

    if (start + limit < all.length) {
      meta.next_page = cursors.encode({
        key: data[data.length - 1].public_key,
      });
    }
    if (start > 0) {
      meta.prev_page = cursors.encode({ key: data[0].public_key });
    }

    return Object.keys(meta).length > 0 ? { data, meta } : { data };
  },
);

const count = responseHandler(
  response.count,
  async (req: RequestValidator<AccountRpcKeyCountReq>) => {
    const account = req.validator.account;

    const all = await list(account);
    const count: AccountRpcKeyCount = { count: String(all?.length ?? 0) };

    return { data: count };
  },
);

export default { count, keys };
