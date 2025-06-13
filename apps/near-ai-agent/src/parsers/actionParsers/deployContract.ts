interface DeployContractAction {
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
