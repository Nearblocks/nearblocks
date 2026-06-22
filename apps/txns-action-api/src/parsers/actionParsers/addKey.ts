import { shortenHex } from 'src/utils/libs';
import { ParsedAction } from 'src/utils/types';

export const AddKeyParser = {
  parse(action: any): ParsedAction {
    const { args = {}, to, receiptId } = action;
    const publicKey = args.public_key;
    const permission = args.access_key?.permission;

    let permissionLabel = 'Unknown';
    let receiver = to;

    if (typeof permission === 'string') {
      permissionLabel = permission;
    } else if (permission?.FunctionCall) {
      permissionLabel = 'FunctionCall';
      receiver = permission.FunctionCall.receiver_id;
    } else if (permission?.permission_kind) {
      permissionLabel = permission.permission_kind;
    }

    return {
      type: 'ADD_KEY',
      receiptId,
      to,
      details: {
        label: 'New key',
        permission: permissionLabel,
        publicKey: shortenHex(publicKey),
        to: {
          address: receiver,
        },
      },
    };
  },
};
