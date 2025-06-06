import express = require('express');

import cors = require('cors');
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import qs from 'query-string';

import logger from './libs/logger';
import routesv1 from './routes/v1/index';

const app = express();

app.set('query parser', (str: string) =>
  qs.parse(str, {
    parseBooleans: true,
    parseNumbers: true,
    types: {
      account: 'string',
      cursor: 'string',
      hash: 'string',
    },
  }),
);
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/v1', routesv1());

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);
  res.status(500).json({ message: 'Server Error' });
});

export default app;
