interface UseGlobalContractAction {
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

export const UseGlobalContractParser = {
  parse(action: UseGlobalContractAction): ParsedAction {
    return {
      type: 'USE_GLOBAL_CONTRACT',
      details: {
        usedContract: action.to,
      },
      to: action.to,
      receiptId: action.receiptId,
    };
  },
};
