import { ParsedAction } from 'src/utils/types';

interface DeployGlobalContractByAccountIdAction {
  action_kind: string;
  to?: string;
  receiptId?: string;
  [key: string]: any;
}

export const DeployGlobalContractByAccountIdParser = {
  parse(action: DeployGlobalContractByAccountIdAction): ParsedAction {
    return {
      type: 'DEPLOY_GLOBAL_CONTRACT_BY_ACCOUNT_ID',
      details: {
        deployedTo: action.to,
      },
      to: action.to,
      receiptId: action.receiptId,
    };
  },
};
