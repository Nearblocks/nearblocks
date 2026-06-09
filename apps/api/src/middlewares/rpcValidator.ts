import { NextFunction, Response } from 'express';

import {
  extractRpcId,
  isAllowedMethod,
  jsonRpcError,
  RPC_ERROR_CODE,
} from '#libs/rpc';
import schema, { Rpc } from '#libs/schema/rpc';
import { RequestValidators } from '#types/types';

// Validates the JSON-RPC proxy body. Unlike the shared `validator` middleware
// (which answers 422 with { errors: [...] }), failures here are returned as a
// JSON-RPC error envelope so RPC clients can parse them. A body that carries a
// recognisable-but-disallowed method gets `method not found` (-32601); anything
// else malformed gets `invalid request` (-32600).
const rpcValidator = (
  req: RequestValidators<Rpc>,
  res: Response,
  next: NextFunction,
) => {
  const result = schema.rpc.safeParse(req.body ?? {});

  if (!result.success) {
    const body = req.body as { method?: unknown } | undefined;
    const id = extractRpcId(req.body);

    if (body && 'method' in body && !isAllowedMethod(body.method)) {
      return res
        .status(400)
        .json(
          jsonRpcError(
            id,
            RPC_ERROR_CODE.METHOD_NOT_FOUND,
            'Method not allowed',
          ),
        );
    }

    return res
      .status(400)
      .json(
        jsonRpcError(id, RPC_ERROR_CODE.INVALID_REQUEST, 'Invalid request'),
      );
  }

  req.validator = result;

  return next();
};

export default rpcValidator;
