interface DeployGlobalContractByAccountIdAction {
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
