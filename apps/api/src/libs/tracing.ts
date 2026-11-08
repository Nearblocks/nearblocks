import {
  BaselimeSDK,
  BetterHttpInstrumentation,
} from '@baselime/node-opentelemetry';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';

import config from '#config';

// Instrumentations patch modules as soon as they are constructed, and the HTTP one
// needs the SDK's meters, so build and start everything only when tracing is on.
const startTracing = () => {
  const sdk = new BaselimeSDK({
    baselimeKey: config.otelExporterApiKey,
    collectorUrl: config.otelExporterEndpoint,
    instrumentations: [
      new BetterHttpInstrumentation({
        ignoreOutgoingRequestHook: (req) =>
          !!req.hostname?.includes('otel.baselime.io'),
      }),
      new ExpressInstrumentation(),
      new PgInstrumentation(),
      new IORedisInstrumentation(),
      new PinoInstrumentation(),
    ],
    service: config.otelServiceName,
  });
  sdk.start();
};

if (config.otelExporterApiKey) startTracing();
