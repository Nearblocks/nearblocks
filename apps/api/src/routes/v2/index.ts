import { Router } from 'express';

import account from '#routes/v2/account';
import exports from '#routes/v2/exports';

const routes = () => {
  const app = Router();

  account(app);
  exports(app);

  return app;
};

export default routes;
