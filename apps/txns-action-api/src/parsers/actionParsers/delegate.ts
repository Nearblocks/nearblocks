import { ActionParser } from './actionParser';
import { ParsedAction } from 'src/utils/types';
import { mapRpcActionToAction } from 'src/utils/near';

export const DelegateActionParser = {
  parse(action: any): ParsedAction[] {
    const delegateAction = action.args?.delegate_action;

    if (!delegateAction?.actions || !Array.isArray(delegateAction.actions)) {
      return [];
    }

    const { receiver_id: receiverId, actions: rawSubActions } = delegateAction;
    const { from, receiptId, txnHash } = action;

    return rawSubActions
      .map((rawSubAction: any) => {
        const base = mapRpcActionToAction(rawSubAction);

        if (!base?.action_kind) return null;

        const enrichedAction = {
          ...base,
          from,
          to: receiverId,
          receiptId,
          txnHash,
        };

        const parsed = ActionParser.parseAction(enrichedAction);
        return Array.isArray(parsed) ? parsed : [parsed];
      })
      .flat()
      .filter(Boolean);
  },
};
