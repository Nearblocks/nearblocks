import { ParsedAction } from 'src/utils/types';
import { yoctoToNear } from 'src/utils/libs';
import { shortenAddress } from 'src/utils/libs';

export const StakeParser = {
  parse: (action: any): ParsedAction => {
    const { from, to, receiptId, args } = action;

    return {
      type: 'Stake',
      details: {
        label: 'Stake',
        stakeAmount: `${yoctoToNear(args?.stake, true)} Ⓝ`,
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
