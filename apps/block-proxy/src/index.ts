import http from 'node:http';

import { logger } from 'nb-logger';

import { createAdminServer } from '#admin';
import config, { logConfigSummary } from '#config';
import { LocalIndexer } from '#indexer/index';
import { createDataServer } from '#server';
import { createAppState } from '#state';

const SHUTDOWN_TIMEOUT_MS = 15_000;

// --- Crash handlers ---

process.on('unhandledRejection', (err) => {
  logger.fatal({ error: String(err) }, 'unhandled rejection, exiting');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.fatal({ error: String(err) }, 'uncaught exception, exiting');
  process.exit(1);
});

// --- Startup ---

logConfigSummary();
logger.info(
  { log_level: config.logLevel, port: config.port },
  'block-proxy starting',
);

const state = createAppState(config);

// Create cache directory (fail fast, only when caching is enabled)
if (config.cacheEnabled) {
  state.cache.ensureDir();
}

if (config.nodeIndexerEnabled) {
  state.localIndexer = new LocalIndexer(config);
}

const dataApp = createDataServer(state);
const adminApp = createAdminServer(state);

const dataServer = http.createServer(dataApp);
const adminServer = http.createServer(adminApp);

// Wait for both servers to bind before marking ready
const dataReady = new Promise<void>((resolve) =>
  dataServer.listen(config.port, config.listenHost, () => {
    logger.info(
      { addr: `${config.listenHost}:${config.port}` },
      'data server listening',
    );
    resolve();
  }),
);

const adminReady = new Promise<void>((resolve) =>
  adminServer.listen(config.adminPort, config.adminListenHost, () => {
    logger.info(
      { addr: `${config.adminListenHost}:${config.adminPort}` },
      'admin server listening',
    );
    resolve();
  }),
);

Promise.all([dataReady, adminReady]).then(() => {
  state.ready = true;
  logger.info('both servers listening, ready');
});

// Start background eviction loop (every 60s, only when caching is enabled)
const evictionInterval = config.cacheEnabled
  ? state.cache.startEvictionLoop(state.stats)
  : null;

// --- Graceful Shutdown ---

const onSignal = (signal: string) => {
  logger.info(
    { signal },
    'shutdown signal received, draining in-flight requests',
  );

  if (evictionInterval) clearInterval(evictionInterval);
  state.ready = false;

  // Force exit if graceful shutdown takes too long
  const forceTimer = setTimeout(() => {
    logger.warn('shutdown timeout exceeded, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  forceTimer.unref();

  const closePromises = [
    state.localIndexer?.stop() ?? Promise.resolve(),
    new Promise<void>((resolve) => dataServer.close(() => resolve())),
    new Promise<void>((resolve) => adminServer.close(() => resolve())),
  ];

  Promise.all(closePromises)
    .then(() => {
      logger.info('servers closed, exiting');
      process.exit(0);
    })
    .catch((err) => {
      logger.error({ error: String(err) }, 'error during shutdown');
      process.exit(1);
    });
};

process.once('SIGTERM', () => onSignal('SIGTERM'));
process.once('SIGINT', () => onSignal('SIGINT'));
