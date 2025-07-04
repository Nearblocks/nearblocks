import { Action, DelegateAction, FunctionCallAction } from 'nb-blocks-minio';

import { Ecdsa, Eddsa } from '#types/types';

export const isFunctionCallAction = (
  action: Action,
): action is FunctionCallAction =>
  (action as FunctionCallAction).FunctionCall !== undefined;

export const isDelegateAction = (action: Action): action is DelegateAction =>
  (action as DelegateAction).Delegate !== undefined;

export const isEcdsa = (obj: unknown): obj is Ecdsa => {
  return (
    (obj as Ecdsa)?.big_r?.affine_point !== undefined &&
    (obj as Ecdsa)?.s?.scalar !== undefined &&
    (obj as Ecdsa)?.recovery_id !== undefined
  );
};

export const isEddsa = (obj: unknown): obj is Eddsa => {
  return (obj as Eddsa)?.signature !== undefined;
};
