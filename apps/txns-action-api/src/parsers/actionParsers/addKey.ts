import { shortenHex } from 'src/utils/libs';
import { ParsedAction } from 'src/utils/types';

interface AddKeyActionArgs {
  public_key: string;
  access_key: {
    permission: any;
    [key: string]: any;
  };
}

interface AddKeyAction {
  action_kind: string;
  args: AddKeyActionArgs;
  to?: string;
  receiptId?: string;
  [key: string]: any;
}

export const AddKeyParser = {
  parse(action: AddKeyAction): ParsedAction {
    const { args, to, receiptId } = action;
    const publicKey = args.public_key;
    const permission = args.access_key?.permission;

    let permissionType = '';
    let permissionDetails: any = null;

    if (typeof permission !== 'object') {
      permissionType = permission;
      permissionDetails = null;
    } else if (permission?.permission_kind) {
      permissionType = permission.permission_kind;
      permissionDetails = permission;
    } else if (permission?.FunctionCall) {
      permissionType = 'FunctionCall';
      permissionDetails = {
        receiver_id: permission.FunctionCall?.receiver_id,
        method_names: permission.FunctionCall?.method_names,
      };
    } else {
      permissionType = 'Unknown';
      permissionDetails = permission;
    }

    return {
      type: 'ADD_KEY',
      details: {
        publicKey: shortenHex(publicKey),
        permissionType,
        permissionDetails,
      },
      to,
      receiptId,
    };
  },
};
