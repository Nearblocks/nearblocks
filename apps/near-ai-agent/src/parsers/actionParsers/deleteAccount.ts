interface DeleteAccountAction {
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
