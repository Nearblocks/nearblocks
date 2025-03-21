import client from 'prom-client';

export const register = new client.Registry();

export const blockGauge = new client.Gauge({
  help: 'Latest block height',
  labelNames: ['network'],
  name: 'block_height_latest',
  registers: [register],
});

export const dataSourceGauge = new client.Gauge({
  help: 'Current data source',
  labelNames: ['network'],
  name: 'data_source_current',
  registers: [register],
});

export const blocksHistogram = new client.Histogram({
  buckets: [100, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000, 3000, 5000],
  help: 'Block processing time in ms',
  labelNames: ['network'],
  name: 'block_processing_ms',
  registers: [register],
});

export const blockHistogram = new client.Histogram({
  buckets: [25, 50, 100, 150, 200, 250, 500, 1000],
  help: 'Block insertion time in ms',
  labelNames: ['network'],
  name: 'block_insertion_ms',
  registers: [register],
});

export const chunkHistogram = new client.Histogram({
  buckets: [25, 50, 100, 150, 200, 250, 500, 1000],
  help: 'Chunks insertion time in ms',
  labelNames: ['network'],
  name: 'chunks_insertion_ms',
  registers: [register],
});

export const txnHistogram = new client.Histogram({
  buckets: [100, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000, 3000, 5000],
  help: 'Transactions insertion time in ms',
  labelNames: ['network'],
  name: 'transactions_insertion_ms',
  registers: [register],
});

export const accountHistogram = new client.Histogram({
  buckets: [25, 50, 100, 150, 200, 250, 500, 1000],
  help: 'Accounts insertion time in ms',
  labelNames: ['network'],
  name: 'accounts_insertion_ms',
  registers: [register],
});

export const keyHistogram = new client.Histogram({
  buckets: [25, 50, 100, 150, 200, 250, 500, 1000],
  help: 'Access keys insertion time in ms',
  labelNames: ['network'],
  name: 'keys_insertion_ms',
  registers: [register],
});

export const s3Histogram = new client.Histogram({
  buckets: [100, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000, 3000, 5000],
  help: 'S3 upload time in ms',
  labelNames: ['network'],
  name: 's3_upload_ms',
  registers: [register],
});
