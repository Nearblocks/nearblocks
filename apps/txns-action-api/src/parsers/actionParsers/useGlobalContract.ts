import { ParsedAction } from 'src/utils/types';

interface UseGlobalContractAction {
  action_kind: string;
  to?: string;
  receiptId?: string;
  [key: string]: any;
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
