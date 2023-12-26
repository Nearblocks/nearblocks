import express, { Router } from 'express';

import schema from '#libs/schema/node';
import validator from '#middlewares/validator';
import node from '#services/node';

const route = Router();

const routes = (app: Router) => {
  app.use('/node', express.json(), route);

  /**
   * GET /v1/node/telemetry
   * @summary POST node telemetry details
   * @tags Node
   * @return 200 - success response
   */
  route.post('/telemetry', validator(schema.nodeTelemetry), node.telemetry);
};

export default routes;
