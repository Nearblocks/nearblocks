import { NextFunction, Request, Response } from 'express';
import * as v from 'valibot';

import { CursorError } from '#libs/errors';

export const asyncHandler =
  <TRequest>(
    handler: (req: TRequest, res: Response, next: NextFunction) => void,
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req as TRequest, res, next)).catch((err) =>
      next(err),
    );
  };

export const responseHandler = <
  TRequest extends Request,
  TResponse extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(
  schema: TResponse,
  handler: (req: TRequest) => Promise<unknown>,
) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await handler(req as TRequest);
        const parsed = v.parse(schema, result);

        res.json(parsed);
      } catch (error) {
        if (error instanceof CursorError) {
          res.status(422).json({
            data: null,
            errors: [{ message: error.message, path: 'cursor' }],
          });
        }

        next(error);
      }
    },
  );
};
