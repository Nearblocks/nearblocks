import { Router } from 'express';

import validators from '#services/validators';
const route = Router();

const routes = (app: Router) => {
  app.use('/validators',route);

  /**
   * GET /v1/validators
   * @summary Get validators
   * @tags validators
   * @return 200 - success response
   */
  route.get('/',  validators.list);

};

export default routes;
