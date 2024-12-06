import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { Resource } from '@opentelemetry/resources';
import * as opentelemetry from '@opentelemetry/sdk-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const sdk = new opentelemetry.NodeSDK({
      instrumentations: [getNodeAutoInstrumentations()],
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'nearblocks-app',
      }),
      traceExporter: new OTLPTraceExporter({
        headers: {
          'x-api-key': process.env.BASELIME_API_KEY || '',
        },
        url: 'https://otel.baselime.io/v1/traces',
      }),
    });

    sdk.start();
  }
}
