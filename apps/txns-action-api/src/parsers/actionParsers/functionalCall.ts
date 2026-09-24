import { shortenAddress } from 'src/utils/libs';
import { ParsedAction } from 'src/utils/types';

export const FunctionCallParser = {
  parse: (action: any): ParsedAction => {
    const methodName =
      action?.args?.method_name ||
      action?.method_name ||
      action?.actionsLog?.[0]?.method_name ||
      '';
    const from = action?.from || '';
    const to = action?.to || '';
    const receiptId = action?.receiptId || null;

    return {
      type: 'FUNCTION_CALL',
      details: {
        label: `Call`,
        methodName,
        from: {
          address: from,
          short: shortenAddress(from),
        },
        to: {
          address: to,
          short: shortenAddress(to),
        },
      },
      from,
      to,
      receiptId,
    };
  },
};
