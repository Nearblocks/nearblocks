import { NextFunction, Response } from 'express';
import { merge } from 'lodash-es';
import { ZodTypeAny } from 'zod';

import { RequestValidators } from '#types/types';

const validator = <T extends ZodTypeAny>(schema: T) => {
  return (
    req: RequestValidators<typeof schema>,
    res: Response,
    next: NextFunction,
  ): Promise<void> | void => {
    const result = schema.safeParse(
      merge(req.body ?? {}, req.query ?? {}, req.params ?? {}),
    );

    if (!result.success) {
      // Return the response immediately if validation fails
      res.status(422).json({ errors: result.error.issues });
      return; // Ensure no further code execution
    }

    // Attach the validation result to the request object
    req.validator = result;

    // Proceed to the next middleware or handler
    next();
  };
};

export default validator;
