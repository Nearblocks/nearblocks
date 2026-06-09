import express, { Router } from 'express';

import schema from '#libs/schema/rpc';
import rpcOrigin from '#middlewares/rpcOrigin';
import rpcRateLimiter from '#middlewares/rpcRateLimiter';
import rpcSession from '#middlewares/rpcSession';
import rpcValidator from '#middlewares/rpcValidator';
import validator from '#middlewares/validator';
import rpc from '#services/rpc';

const route = Router();

// Proxied JSON-RPC bodies are tiny (a query/tx_status payload); cap them well
// below the default to blunt body-size abuse. There is no global body parser,
// so the proxy parses its own JSON.
const jsonBody = express.json({ limit: '512kb' });

const routes = (app: Router) => {
  // Guard chain: parse body -> origin allowlist -> per-IP rate limit -> route.
  // Intentionally NO bearerAuth: the browser calls this anonymously. We use a
  // DEDICATED rpcRateLimiter (not the shared API plan limiter) so anonymous
  // browser RPC does not fall onto the 6 req/min free-plan path and 429 a normal
  // pageview; it has its own generous per-IP budget on the same redis store.
  app.use('/rpc', jsonBody, rpcOrigin, rpcRateLimiter, route);

  // NOTE: deliberately left without swagger/openapi JSDoc blocks. This is an
  // internal first-party proxy for the explorer frontend, not a public API, so
  // it must stay out of the generated api-docs spec (apiDocumentation globs
  // routes/*.ts for documentation comments).
  route.post('/', rpcSession, rpcValidator, rpc.proxy);
  route.post('/archival', rpcSession, rpcValidator, rpc.archival);
  route.post('/session', validator(schema.session), rpc.session);
};

export default routes;
