import { NextFunction, Response } from 'express';
import { merge } from 'lodash-es';
import { ZodTypeAny } from 'zod';

import { RequestValidators } from '#types/types';

const validator = <T extends ZodTypeAny>(schema: T) => {
  return (
    req: RequestValidators<typeof schema>,
    res: Response,
    next: NextFunction,
  ) => {
    const result = schema.safeParse(
      merge(req.body ?? {}, req.query ?? {}, req.params ?? {}, req.files ?? {}),
    );

    if (!result.success) {
      return res.status(422).json({ errors: result.error.issues });
    }

    req.validator = result;

    return next();
  };
};

export default validator;
