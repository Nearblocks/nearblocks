import { Router } from 'express';

import campaigns from '#routes/campaigns';

const routes = () => {
  const app = Router();

  campaigns(app);

  return app;
};

export default routes;
