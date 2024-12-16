import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { KnexInstrumentation } from '@opentelemetry/instrumentation-knex';
import { Resource } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

import { logger } from 'nb-logger';

import config from '#config';

export const setupTracing = () => {
  const sdk = new NodeSDK({
    instrumentations: [
      ...getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-knex': {
          enabled: true,
        },
      }),
      new KnexInstrumentation({
        maxQueryLength: 500,
        requireParentSpan: false,
      }),
    ],
    resource: new Resource({
      data_source: config.dataSource,
      network: config.network,
      [SEMRESATTRS_SERVICE_NAME]: 'base-indexer',
    }),
    spanProcessor: new BatchSpanProcessor(
      new OTLPTraceExporter({
        headers: {
          'x-api-key': config.baselimeApiKey || '',
        },
        url: config.otelEndpoint,
      }),
    ),
  });

  sdk.start();
  logger.info('OpenTelemetry tracing initialized');

  return sdk;
};
