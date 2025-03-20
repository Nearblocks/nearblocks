import { Router } from 'express';

import account from '#routes/v2/account';

const routes = () => {
  const app = Router();

  account(app);

  return app;
};

export default routes;
