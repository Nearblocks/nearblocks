import * as v from 'valibot';

import { CursorError } from '#libs/errors';

type CursorValue = boolean | null | number | string;
export type CursorObject = Record<string, CursorValue>;

export const encode = <T>(data: T): string => {
  return Buffer.from(JSON.stringify(data)).toString('base64');
};

export const decode = <
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: TSchema,
  cursor: string,
): v.InferOutput<TSchema> => {
  try {
    const json = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));

    return v.parse(schema, json);
  } catch (error) {
    throw new CursorError(`Invalid cursor`);
  }
};

export default { decode, encode };
