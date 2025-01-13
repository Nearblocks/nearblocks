import express, { Router } from 'express';

import auth from '#routes/auth';
import campaigns from '#routes/campaigns';
import profile from '#routes/profile';

const route = Router();

const routes = () => {
  const app = Router();
  app.use('/', express.json(), express.urlencoded({ extended: false }), route);
  campaigns(app);
  auth(app);
  profile(app);

  return app;
};

export default routes;
