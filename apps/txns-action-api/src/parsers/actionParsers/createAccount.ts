import { ParsedAction } from 'src/utils/types';

interface CreateAccountAction {
  action_kind: string;
  to?: string;
  receiptId?: string;
  [key: string]: any;
}

export const CreateAccountParser = {
  parse(action: CreateAccountAction): ParsedAction {
    return {
      type: 'CREATE_ACCOUNT',
      details: {
        createdAccount: action.to,
      },
      to: action.to,
      receiptId: action.receiptId,
    };
  },
};
