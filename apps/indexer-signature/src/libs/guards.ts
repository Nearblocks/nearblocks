import { Action, DelegateAction, FunctionCallAction } from 'nb-neardata';

import { Scheme } from '#types/types';

export const isFunctionCallAction = (
  action: Action,
): action is FunctionCallAction =>
  (action as FunctionCallAction).FunctionCall !== undefined;

export const isDelegateAction = (action: Action): action is DelegateAction =>
  (action as DelegateAction).Delegate !== undefined;

export const hasScheme = (obj: unknown): obj is { scheme: Scheme } => {
  return typeof (obj as { scheme: unknown }).scheme === 'string';
};
