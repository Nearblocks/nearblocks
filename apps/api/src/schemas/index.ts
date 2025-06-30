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

export type ResponseData<T> = T extends v.BaseSchema<
  unknown,
  unknown,
  v.BaseIssue<unknown>
>
  ? v.InferOutput<ReturnType<typeof responseSchema<T>>>
  : never;

export type JsonData =
  | { [key: string]: JsonData }
  | boolean
  | JsonData[]
  | null
  | number
  | string;

export const jsonSchema: v.GenericSchema<JsonData> = v.lazy(() =>
  v.union([
    v.string(),
    v.number(),
    v.boolean(),
    v.null(),
    v.record(v.string(), jsonSchema),
    v.array(jsonSchema),
  ]),
);
