import { Router } from 'express';

import txns from '../../routes/v1/txns';

const routes = () => {
  const app = Router();
  txns(app);

  return app;
};

export default routes;
