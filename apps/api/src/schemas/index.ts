import * as v from 'valibot';

export const responseSchema = <
  T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: T,
) => {
  return v.object({
    data: v.nullable(schema),
    errors: v.optional(v.array(responseError)),
    meta: v.optional(responseMeta),
  });
};

export const responseError = v.object({
  message: v.string(),
  path: v.optional(v.nullable(v.string())),
});

export const responseMeta = v.object({
  cursor: v.optional(v.string()),
});
