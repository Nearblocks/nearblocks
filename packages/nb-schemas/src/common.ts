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
  next_page: v.optional(v.string()),
  prev_page: v.optional(v.string()),
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
    v.array(jsonSchema),
    v.record(v.string(), jsonSchema),
  ]),
);

export const limitSchema = v.optional(
  v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(100)),
  25,
);

export const statsLimitSchema = v.optional(
  v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(365)),
);

export const cursorSchema = v.optional(v.pipe(v.string(), v.base64()));

export const tsSchema = v.optional(
  v.pipe(
    v.string(),
    v.regex(/^\d+$/, 'Invalid type: Expected numeric string'),
    v.length(19),
  ),
);
