import { ParsedAction } from 'src/utils/types';
import { shortenAddress } from 'src/utils/libs';

export const UseGlobalContractByAccountIdParser = {
  parse: (action: any): ParsedAction => {
    const to = action.to;
    const receiptId = action.receiptId || null;

    return {
      type: 'UseGlobalContractByAccountId',
      details: {
        label: 'Use Global Contract By AccountId',
        to: {
          address: to,
          short: shortenAddress(to),
        },
      },
      from: action.from,
      to,
      receiptId,
    };
  },
};
