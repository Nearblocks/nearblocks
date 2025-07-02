import * as v from 'valibot';

import { CursorError } from '#libs/errors';

type CursorValue = boolean | null | number | string;
export type CursorObject = Record<string, CursorValue>;

/**
 * Encodes a JavaScript object as a base64 string for use as a cursor.
 *
 * @param data - The data object to encode.
 * @returns The base64-encoded string representation of the object.
 */
export const encode = <T>(data: T): string => {
  return Buffer.from(JSON.stringify(data)).toString('base64');
};

/**
 * Decodes a base64-encoded cursor string into a JavaScript object and validates it against the provided schema.
 *
 * @param schema - The Valibot schema to validate the decoded object.
 * @param cursor - The base64-encoded string to decode.
 * @returns The validated object parsed from the cursor.
 * @throws CursorError if the cursor is invalid or fails schema validation.
 */
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
