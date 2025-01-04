import {
  BaselimeSDK,
  BetterHttpInstrumentation,
} from '@baselime/node-opentelemetry';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';

import config from '#config';

import logger from './logger.js';

export const sdk = new BaselimeSDK({
  baselimeKey: config.otelExporterApiKey,
  collectorUrl: config.otelExporterEndpoint,
  instrumentations: [
    new BetterHttpInstrumentation({
      ignoreOutgoingRequestHook: (req) => {
        if (req.hostname?.includes('otel.baselime.io')) {
          return true;
        }
        return false;
      },
    }),
    new ExpressInstrumentation(),
    new PgInstrumentation(),
    new IORedisInstrumentation(),
    new PinoInstrumentation(),
  ],
  service: config.otelServiceName,
});

sdk.start();
logger.info('OpenTelemetry SDK started successfully.');
