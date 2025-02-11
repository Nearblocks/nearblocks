import { Action, DelegateAction, FunctionCallAction } from 'nb-blocks';

export const isFunctionCallAction = (
  action: Action,
): action is FunctionCallAction =>
  (action as FunctionCallAction).FunctionCall !== undefined;

export const isDelegateAction = (action: Action): action is DelegateAction =>
  (action as DelegateAction).Delegate !== undefined;
