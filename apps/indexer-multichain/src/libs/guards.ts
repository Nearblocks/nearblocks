import { types } from 'near-lake-framework';

export const isFunctionCallAction = (
  action: types.Action,
): action is types.FunctionCallAction =>
  (action as types.FunctionCallAction).FunctionCall !== undefined;

export const isDelegateAction = (
  action: types.Action,
): action is types.DelegateAction =>
  (action as types.DelegateAction).Delegate !== undefined;
