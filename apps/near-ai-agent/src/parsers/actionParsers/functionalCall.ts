import { shortenAddress } from 'src/utils/libs';

interface ParsedAction {
  type: string;
  details: Record<string, any>;
  from?: string;
  to?: string;
  receiptId?: string;
}

export const FunctionCallParser = {
  parse: (action: any): ParsedAction => {
    const methodName = action?.args?.method_name || '';
    const from = action?.from || '';
    const to = action?.to || '';
    const receiptId = action?.receiptId || null;

    return {
      type: 'FunctionCall',
      details: {
        label: `Call ${methodName}`,
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
