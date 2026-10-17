import express from 'express';

import { register } from '#metrics';
import type { AppState } from '#state';

export function createAdminServer(state: AppState): express.Express {
  const app = express();

  // GET /metrics — Prometheus text format
  app.get('/metrics', async (_req, res) => {
    res
      .set('content-type', register.contentType)
      .send(await register.metrics());
  });

  // GET /stats — JSON stats snapshot
  app.get('/stats', (_req, res) => {
    const tipHeight = state.tipHeight;
    const uptimeSecs = Math.floor((Date.now() - state.startTime) / 1000);
    const snapshot = state.stats.snapshot(tipHeight, uptimeSecs, {
      neardata: state.neardataEnabled,
      proxy: state.config.blockSources.includes('proxy'),
      s3: state.s3Enabled,
    });
    res.json(
      state.localIndexer
        ? {
            ...snapshot,
            block_sources: state.config.blockSources,
            local_indexer: {
              ...state.localIndexer.status,
              in_sync: state.localIndexer.isInSync(),
              lag_secs: state.localIndexer.lagSecs(),
            },
          }
        : { ...snapshot, block_sources: state.config.blockSources },
    );
  });

  return app;
}
