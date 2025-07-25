import { ParsedAction } from 'src/utils/types';

interface DeployGlobalContractAction {
  action_kind: string;
  to?: string;
  receiptId?: string;
  [key: string]: any;
}

export const DeployGlobalContractParser = {
  parse(action: DeployGlobalContractAction): ParsedAction {
    return {
      type: 'DEPLOY_GLOBAL_CONTRACT',
      details: {
        deployedTo: action.to,
      },
      to: action.to,
      receiptId: action.receiptId,
    };
  },
};
