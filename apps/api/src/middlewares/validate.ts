import { NextFunction, Request, Response } from 'express';
import * as v from 'valibot';

export interface RequestValidator<T> extends Request {
  validator: T;
}

export const validate = <
  T extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: T,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = v.parse(schema, {
        ...req.params,
        ...req.query,
        ...req.body,
      });
      (req as RequestValidator<v.InferOutput<T>>).validator = parsed;

      return next();
    } catch (err: unknown) {
      if (v.isValiError(err)) {
        const errors = err.issues.map((issue) => ({
          message: issue.message,
          path: v.getDotPath<T>(issue),
        }));

        return res.status(422).json({ data: null, errors });
      }

      return next(err);
    }
  };
};
