import express, { Router } from 'express';

import schema from '#libs/schema/node';
import validator from '#middlewares/validator';
import node from '#services/node';

const route = Router();

const routes = (app: Router) => {
  app.use('/node', express.json(), route);

  route.post('/telemetry', validator(schema.telemetry), node.telemetry);
};

export default routes;
