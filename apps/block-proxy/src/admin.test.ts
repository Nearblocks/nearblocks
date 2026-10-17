import type { AddressInfo } from 'node:net';

import { describe, expect, it, vi } from 'vitest';

import type { AppState } from '#state';
import { StatsCollector } from '#stats';

import { createAdminServer } from './admin.js';

describe('admin /stats', () => {
  it('reports node sync state under local_indexer', async () => {
    const state = {
      config: { blockSources: ['node'] },
      localIndexer: {
        isInSync: vi.fn().mockReturnValue(false),
        lagSecs: vi.fn().mockReturnValue(42.5),
        status: { error: null, head: 7, pending: 0, published: 5 },
      },
      neardataEnabled: false,
      s3Enabled: false,
      startTime: Date.now(),
      stats: new StatsCollector(),
      tipHeight: 0,
    } as unknown as AppState;
    const server = createAdminServer(state).listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.once('listening', resolve));
    try {
      const { port } = server.address() as AddressInfo;
      const body = (await (
        await fetch(`http://127.0.0.1:${port}/stats`)
      ).json()) as { local_indexer: Record<string, unknown> };
      expect(body.local_indexer).toEqual({
        error: null,
        head: 7,
        in_sync: false,
        lag_secs: 42.5,
        pending: 0,
        published: 5,
      });
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
