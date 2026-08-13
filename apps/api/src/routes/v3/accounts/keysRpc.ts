import { Router } from 'express';

import request from 'nb-schemas/dist/accounts/keys/rpc/request.js';

import internalOnly from '#middlewares/internalOnly';
import { validate } from '#middlewares/validate';
import service from '#services/v3/accounts/keysRpc';

const routes = (route: Router) => {
  route.get('/:account/keys/rpc', validate(request.keys), service.keys);

  route.get(
    '/:account/keys/rpc/count',
    internalOnly,
    validate(request.count),
    service.count,
  );
};

export default routes;
