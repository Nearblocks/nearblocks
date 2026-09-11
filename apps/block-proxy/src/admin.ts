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
    const enabledSources = [
      ...(state.s3Enabled ? ['s3'] : []),
      ...state.pool.names(),
    ];
    const snapshot = state.stats.snapshot(
      tipHeight,
      uptimeSecs,
      enabledSources,
    );
    res.json(snapshot);
  });

  return app;
}
