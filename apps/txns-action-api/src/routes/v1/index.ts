import { Router } from 'express';

import txns from './txns';

const routes = () => {
  const app = Router();
  txns(app);

  return app;
};

export default routes;
