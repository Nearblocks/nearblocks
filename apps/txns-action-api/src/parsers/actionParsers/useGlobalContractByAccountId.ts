import { ParsedAction } from 'src/utils/types';
import { shortenAddress } from 'src/utils/libs';

export const UseGlobalContractByAccountIdParser = {
  parse: (action: any): ParsedAction => {
    const to = action.to;
    const receiptId = action.receiptId || null;

    return {
      type: 'USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID',
      details: {
        label: 'USE_GLOBAL_CONTRACT_BY_ACCOUNT_ID',
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
