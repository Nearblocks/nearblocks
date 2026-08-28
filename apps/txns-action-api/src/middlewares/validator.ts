import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';

const validator = <T extends ZodTypeAny>(schema: T): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse({
      ...req.body,
      ...req.query,
      ...req.params,
    });

    if (!result.success) {
      res.status(422).json({ errors: result.error.issues });
      return;
    }

    (req as any).validator = result;

    return next();
  };
};

export default validator;
