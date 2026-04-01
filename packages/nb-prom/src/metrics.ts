import client from 'prom-client';

export interface SyncMetrics {
  blockHeight: client.Gauge;
  lastBlockTimestamp: client.Gauge;
}

export interface PerfMetrics {
  blockProcessingSeconds: client.Histogram;
  blocksProcessedTotal: client.Counter;
}

export interface ErrorMetrics {
  errorsTotal: client.Counter<'type'>;
}

export interface InfraMetrics {
  dbPoolActive: client.Gauge;
  dbPoolIdle: client.Gauge;
  dbPoolWaiting: client.Gauge;
}

export function createSyncMetrics(register: client.Registry): SyncMetrics {
  return {
    blockHeight: new client.Gauge({
      help: 'Current block height the indexer has processed',
      name: 'indexer_block_height',
      registers: [register],
    }),
    lastBlockTimestamp: new client.Gauge({
      help: 'Unix timestamp (seconds) of the last processed block',
      name: 'indexer_last_block_timestamp_seconds',
      registers: [register],
    }),
  };
}

export function createPerfMetrics(register: client.Registry): PerfMetrics {
  return {
    blockProcessingSeconds: new client.Histogram({
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10],
      help: 'Time in seconds to process a single block',
      name: 'indexer_block_processing_seconds',
      registers: [register],
    }),
    blocksProcessedTotal: new client.Counter({
      help: 'Total number of blocks processed by the indexer',
      name: 'indexer_blocks_processed_total',
      registers: [register],
    }),
  };
}

export function createErrorMetrics(register: client.Registry): ErrorMetrics {
  return {
    errorsTotal: new client.Counter({
      help: 'Total number of errors encountered by the indexer',
      labelNames: ['type'],
      name: 'indexer_errors_total',
      registers: [register],
    }),
  };
}

export function createInfraMetrics(register: client.Registry): InfraMetrics {
  return {
    dbPoolActive: new client.Gauge({
      help: 'Number of active connections in the database pool',
      name: 'indexer_db_pool_active',
      registers: [register],
    }),
    dbPoolIdle: new client.Gauge({
      help: 'Number of idle connections in the database pool',
      name: 'indexer_db_pool_idle',
      registers: [register],
    }),
    dbPoolWaiting: new client.Gauge({
      help: 'Number of requests waiting for a database connection',
      name: 'indexer_db_pool_waiting',
      registers: [register],
    }),
  };
}
