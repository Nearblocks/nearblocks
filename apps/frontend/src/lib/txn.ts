type Action = {
  action: string;
  method: null | string;
};

export const actionMethod = (actions: Action[]) => {
  const count = actions?.length || 0;

  if (!count) return 'Unknown';
  if (count > 2) return 'Batch Txn';

  const action = actions[0];

  if (action.action === 'FUNCTION_CALL') {
    return action.method ?? 'Unknown';
  }

  return action.action;
};

export const txnFee = () => {};
