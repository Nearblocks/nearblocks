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
      neardata: state.config.blockSources.includes('neardata'),
      proxy: state.config.blockSources.includes('proxy'),
    });
    const checks = {
      proxy_null_overridden: state.stats.proxyNullOverridden,
      ...(state.shadow
        ? {
            shadow: {
              ...state.shadow.counts,
              last_mismatch_height: state.shadow.lastMismatchHeight,
              sample_rate: state.config.shadowSampleRate,
              source: state.config.shadowSource,
            },
          }
        : {}),
    };
    res.json(
      state.localIndexer
        ? {
            ...snapshot,
            ...checks,
            block_sources: state.config.blockSources,
            local_indexer: {
              ...state.localIndexer.status,
              in_sync: state.localIndexer.isInSync(),
              lag_secs: state.localIndexer.lagSecs(),
            },
          }
        : { ...snapshot, ...checks, block_sources: state.config.blockSources },
    );
  });

  return app;
}
