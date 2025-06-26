import { ParsedAction } from 'src/utils/types';
import { yoctoToNear, shortenAddress } from 'src/utils/libs';

export const TransferParser = {
  parse: (action: any): ParsedAction => {
    const { from, to, receiptId, args } = action;
    const deposit = args?.deposit ?? '0';

    return {
      type: 'Transfer',
      details: {
        label: 'Transfer',
        deposit: `${yoctoToNear(deposit, true)} Ⓝ`,
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
