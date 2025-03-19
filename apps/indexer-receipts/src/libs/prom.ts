import client from 'prom-client';

export const register = new client.Registry();

export const cacheHistogram = new client.Histogram({
  buckets: [0.25, 0.5, 0.75, 1, 2, 3, 5, 10, 25, 50, 100, 500, 1000],
  help: 'Cache processing time in ms',
  labelNames: ['network'],
  name: 'cache_processing_ms',
  registers: [register],
});

export const receiptHistogram = new client.Histogram({
  buckets: [100, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000, 3000, 5000],
  help: 'Receipts insertion time in ms',
  labelNames: ['network'],
  name: 'receipts_insertion_ms',
  registers: [register],
});

export const outcomeHistogram = new client.Histogram({
  buckets: [100, 200, 300, 400, 500, 600, 800, 1000, 1500, 2000, 3000, 5000],
  help: 'Outcomes insertion time in ms',
  labelNames: ['network'],
  name: 'outcomes_insertion_ms',
  registers: [register],
});
