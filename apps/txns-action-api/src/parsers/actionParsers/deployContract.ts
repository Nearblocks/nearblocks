import { ParsedAction } from 'src/utils/types';

interface DeployContractAction {
  action_kind: string;
  to?: string;
  receiptId?: string;
  [key: string]: any;
}

export const DeployContractParser = {
  parse(action: DeployContractAction): ParsedAction {
    return {
      type: 'DEPLOY_CONTRACT',
      details: {
        deployedTo: action.to,
      },
      to: action.to,
      receiptId: action.receiptId,
    };
  },
};
