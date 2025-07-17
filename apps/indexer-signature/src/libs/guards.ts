import { Action, DelegateAction, FunctionCallAction } from 'nb-blocks-minio';

import { Ed25519Signature, Scheme } from '#types/types';

export const isFunctionCallAction = (
  action: Action,
): action is FunctionCallAction =>
  (action as FunctionCallAction).FunctionCall !== undefined;

export const isDelegateAction = (action: Action): action is DelegateAction =>
  (action as DelegateAction).Delegate !== undefined;

export const isEd25519 = (obj: unknown): obj is Ed25519Signature => {
  return (obj as Ed25519Signature)?.signature !== undefined;
};

export const hasScheme = (obj: unknown): obj is { scheme: Scheme } => {
  return typeof (obj as { scheme: unknown }).scheme === 'string';
};
