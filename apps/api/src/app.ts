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
import { register as metricsRegister } from '#libs/promMetrics';
import sentry from '#libs/sentry';
import internalOnly from '#middlewares/internalOnly';
import { kitwalletClientMetrics } from '#middlewares/kitwalletClients';
import legacyApi from '#middlewares/legacyApi';
import { anonymousStrategy, bearerStrategy } from '#middlewares/passport';
import { usageEvents } from '#middlewares/usageEvents';
import routes from '#routes/index';
import routesV2 from '#routes/v2/index';
import routesV3 from '#routes/v3/index';
import {
  ingest as ingestNodeTelemetry,
  ingestErrors as ingestNodeTelemetryErrors,
} from '#services/v3/nodes/index';

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
      affected: 'string',
      after_timestamp: 'string',
      after_ts: 'string',
      before_timestamp: 'string',
      before_ts: 'string',
      block: 'string',
      block_end: 'string',
      block_start: 'string',
      cursor: 'string',
      hash: 'string',
      involved: 'string',
      keyword: 'string',
      multichain_address: 'string',
      predecessor: 'string',
      receiver: 'string',
      signer: 'string',
      token: 'string',
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
app.get('/metrics', internalOnly, async (_req, res, next) => {
  try {
    res.setHeader('Content-Type', metricsRegister.contentType);
    res.end(await metricsRegister.metrics());
  } catch (error) {
    next(error);
  }
});

// Request start time, for the duration in error logs.
app.use((_req, res, next) => {
  res.locals.startedAt = Date.now();
  next();
});
// NEAR node telemetry (explorer.*.near.org/api/nodes): before rate limiting, usage
// tracking and the legacy sunset, so nodes always get an instant 200.
app.post(
  '/v1/legacy/nodes',
  express.json({ limit: '4kb' }),
  ingestNodeTelemetry,
  ingestNodeTelemetryErrors,
);
app.use(kitwalletClientMetrics);
app.use(usageEvents);
app.use(legacyApi);

app.use('/v1', routes());
app.use('/v2', routesV2());
app.use('/v3', routesV3());

app.use((_req: Request, res: Response) => {
  res.status(404).json({ data: null, errors: [{ message: 'Not Found' }] });
});

app.use(sentry.Handlers.errorHandler());

// Request context for error logs; 57014 is a Postgres statement timeout.
const errorContext = (err: Error, req: Request, res: Response) => ({
  code: (err as { code?: unknown }).code,
  durationMs:
    typeof res.locals.startedAt === 'number'
      ? Date.now() - res.locals.startedAt
      : undefined,
  method: req.method,
  path: req.originalUrl.split('?')[0],
  route: req.route?.path,
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  if (v.isValiError(err)) {
    const errors = err.issues.map(
      (issue) => `${v.getDotPath(issue)}: ${issue.message}`,
    );
    logger.error(
      { ...errorContext(err, req, res), errors },
      'invalid response',
    );
    return res
      .status(500)
      .json({ data: null, errors: [{ message: 'Server Error' }] });
  }

  logger.error({ ...errorContext(err, req, res), err }, err.message);
  return res
    .status(500)
    .json({ data: null, errors: [{ message: 'Server Error' }] });
});

export default app;
