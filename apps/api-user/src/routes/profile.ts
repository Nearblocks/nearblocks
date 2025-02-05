import { Router } from 'express';

import schema from '#libs/schema/profile';
import { jwtAuth } from '#middlewares/passport';
import validator from '#middlewares/validator';
import profile from '#services/profile';

const route = Router();

const routes = (app: Router) => {
  app.use('/', route);

  route.get('/users/me', jwtAuth, profile.info);

  route.post(
    '/users/me/email',
    jwtAuth,
    validator(schema.email),
    profile.email,
  );
  route.patch(
    '/users/me/password',
    jwtAuth,
    validator(schema.password),
    profile.password,
  );
  route.delete(
    '/users/me',
    jwtAuth,
    validator(schema.destroy),
    profile.destroy,
  );

  route.patch(
    '/users/me/email',
    validator(schema.updateEmail),
    profile.updateEmail,
  );
};

export default routes;
