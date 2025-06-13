interface CreateAccountAction {
  action_kind: string;
  to?: string;
  receiptId?: string;
  [key: string]: any;
}

interface ParsedAction {
  type: string;
  details: Record<string, any>;
  from?: string;
  to?: string;
  receiptId?: string;
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
