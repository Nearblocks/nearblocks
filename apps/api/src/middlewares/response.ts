import { NextFunction, Request, Response } from 'express';
import * as v from 'valibot';

import { CursorError } from '#libs/errors';

/**
 * Async route handler to catch and forward any errors to the next middleware.
 * Supports both synchronous and asynchronous handlers, ensuring unhandled promise rejections are passed to Express error handling.
 *
 * @param handler - The route handler function to wrap.
 * @returns A new function compatible with Express middleware.
 */
export const asyncHandler =
  <TRequest>(
    handler: (req: TRequest, res: Response, next: NextFunction) => void,
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req as TRequest, res, next)).catch((err) =>
      next(err),
    );
  };

/**
 * Response route handler with response validation and error handling.
 * Validates the handler's result against the provided Valibot schema before sending the JSON response.
 * If a CursorError is thrown, responds with a 422 error; otherwise, forwards errors to Express.
 *
 * @param schema - The Valibot schema to validate the response.
 * @param handler - The async route handler function.
 * @returns An Express-compatible middleware function.
 */
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
