import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import passport from 'passport';
import qs from 'query-string';
import * as v from 'valibot';

import apiDocumentation from '#libs/apiDocumentation';
import logger from '#libs/logger';
import sentry from '#libs/sentry';
import { anonymousStrategy, bearerStrategy } from '#middlewares/passport';
import routes from '#routes/index';
import routesV2 from '#routes/v2/index';
import routesV3 from '#routes/v3/index';

const file = fileURLToPath(import.meta.url);
const dir = path.dirname(file);
const app = express();

app.set('x-powered-by', false);
app.set('query parser', (str: string) =>
  qs.parse(str, {
    parseBooleans: true,
    parseNumbers: true,
    types: {
      account: 'string',
      after_timestamp: 'string',
      after_ts: 'string',
      before_timestamp: 'string',
      before_ts: 'string',
      cursor: 'string',
      hash: 'string',
      keyword: 'string',
      multichain_address: 'string',
    },
  }),
);

app.use(sentry.Handlers.requestHandler());
apiDocumentation(app, dir);
app.use(cors());
app.use(helmet());
passport.use(bearerStrategy);
passport.use(anonymousStrategy);

app.set('trust proxy', 2);
app.get('/ip', (req, res) => res.send(req.ip));

app.use('/v1', routes());
app.use('/v2', routesV2());
app.use('/v3', routesV3());

app.get('/v1/kitwallet', (_req, res) => {
  const htmlFilePath = path.join(dir, '..', 'src', 'kitwallet', 'index.html');
  res.sendFile(htmlFilePath);
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({ data: null, errors: [{ message: 'Not Found' }] });
});

app.use(sentry.Handlers.errorHandler());

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (v.isValiError(err)) {
    const errors = err.issues.map(
      (issue) => `${v.getDotPath(issue)}: ${issue.message}`,
    );
    logger.error(errors);
    return res
      .status(500)
      .json({ data: null, errors: [{ message: 'Server Error' }] });
  }

  logger.error(err.stack);
  return res
    .status(500)
    .json({ data: null, errors: [{ message: 'Server Error' }] });
});

export default app;
