import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import helmet from 'helmet';
import qs from 'query-string';
import passport from 'passport';
import express, { Request, Response } from 'express';

import sentry from '#libs/sentry';
import routes from '#routes/index';
import swagger from '#libs/swagger';
import { bearerStrategy, anonymousStrategy } from '#middlewares/passport';

const file = fileURLToPath(import.meta.url);
const dir = path.dirname(file);

const app = express();

app.set('x-powered-by', false);
app.set('query parser', (str: string) =>
  qs.parse(str, { parseBooleans: true, parseNumbers: true }),
);

app.use(sentry.Handlers.requestHandler());

swagger(app, dir);
app.use(cors());
app.use(helmet());
passport.use(bearerStrategy);
passport.use(anonymousStrategy);

app.set('trust proxy', 1);
app.get('/ip', (req, res) => res.send(req.ip));

app.use('/v1', routes());

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use(sentry.Handlers.errorHandler());

app.use((err: Error, _req: Request, res: Response) => {
  res.status(500).json({ message: err.message });
});

export default app;
