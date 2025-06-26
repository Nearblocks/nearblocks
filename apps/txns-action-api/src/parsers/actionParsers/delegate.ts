import { ActionParser } from './actionParser';
import { shortenAddress } from 'src/utils/libs';
import { ParsedAction } from 'src/utils/types';

export const DelegateActionParser = {
  parse(action: any): ParsedAction {
    console.log('action from delegate', action);
    const delegate = action.args?.delegate_action;
    const subActions = delegate?.actions || [];
    const receiverId = delegate?.receiver_id || '';
    const from = action.from;
    const to = action.to;
    const receiptId = action.receiptId;
    const txnHash = action.txnHash;

    const parsedSubActions = subActions.map((subAction: any) => {
      return ActionParser.parseAction({
        ...subAction,
        from,
        to,
        receiptId,
        txnHash,
        receiver: receiverId,
      });
    });

    return {
      type: 'DELEGATE_ACTION',
      from,
      to,
      receiptId,
      txnHash,
      details: {
        label: 'DELEGATE_ACTION',
        receiver: {
          address: receiverId,
          short: shortenAddress(receiverId),
        },
        subActions: parsedSubActions,
      },
    };
  },
};
