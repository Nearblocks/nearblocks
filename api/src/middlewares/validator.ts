import { ZodTypeAny } from 'zod';
import { merge } from 'lodash-es';
import { Response, NextFunction } from 'express';

import { RequestValidators } from '#ts/types';

const validator = <T extends ZodTypeAny>(schema: T) => {
  return (
    req: RequestValidators<typeof schema>,
    res: Response,
    next: NextFunction,
  ) => {
    const result = schema.safeParse(
      merge(req.body ?? {}, req.query ?? {}, req.params ?? {}),
    );

    if (!result.success) {
      return res.status(422).json({ errors: result.error.issues });
    }

    req.validator = result;

    return next();
  };
};

export default validator;
