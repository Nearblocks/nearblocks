import { ParsedAction } from 'src/utils/types';

interface DeleteAccountAction {
  action_kind: string;
  to?: string;
  receiptId?: string;
  [key: string]: any;
}

export const DeleteAccountParser = {
  parse(action: DeleteAccountAction): ParsedAction {
    return {
      type: 'DELETE_ACCOUNT',
      details: {
        deletedAccount: action.to,
      },
      to: action.to,
      receiptId: action.receiptId,
    };
  },
};
