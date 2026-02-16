import type {
  FieldError,
  FieldValues,
  Resolver,
  ResolverOptions,
} from 'react-hook-form';
import type * as z from 'zod/v4/mini';

type ZodSchema = z.ZodMiniType<any, any, any>;

export const zodResolver = <T extends FieldValues>(
  schema: ZodSchema,
): Resolver<T> => {
  return async (values: T, _context: any, options?: ResolverOptions<T>) => {
    const criteriaAll = options?.criteriaMode === 'all';
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return { errors: {} as any, values: result.data };
    }

    const errors: Record<string, FieldError> = {};

    const formatPath = (path: (number | string | symbol)[]) =>
      path
        .filter(
          (key): key is number | string =>
            typeof key === 'string' || typeof key === 'number',
        )
        .reduce(
          (acc, curr) =>
            acc
              ? acc + (typeof curr === 'number' ? `[${curr}]` : `.${curr}`)
              : `${curr}`,
          '',
        );

    result.error.issues.forEach((issue) => {
      const path = formatPath(issue.path);

      if (!errors[path]) {
        errors[path] = { message: issue.message, type: issue.code };
      }

      if (criteriaAll) {
        errors[path] = {
          ...(errors[path] || {}),
          message: issue.message,
          type: issue.code,
          types: {
            ...(errors[path]?.types || {}),
            [issue.code]: issue.message,
          },
        };
      }
    });

    return { errors: errors as any, values: {} as any };
  };
};
