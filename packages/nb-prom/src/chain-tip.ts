import client from 'prom-client';

export interface ChainTipOptions {
  register: client.Registry;
  blockProxyUrl: string;
  intervalMs?: number;
  logger?: { warn: (msg: string, meta?: unknown) => void };
}

export interface ChainTipPoller {
  stop: () => void;
  chainTipHeight: client.Gauge;
}

export function startChainTipPoller(options: ChainTipOptions): ChainTipPoller {
  const { register, blockProxyUrl, intervalMs = 5000, logger } = options;

  const chainTipHeight = new client.Gauge({
    help: 'Current chain tip height as reported by block-proxy',
    name: 'indexer_chain_tip_height',
    registers: [register],
  });

  const fetchTimeout = Math.max(intervalMs - 1000, 2000);

  async function fetchTip(): Promise<void> {
    try {
      const res = await fetch(`${blockProxyUrl}/metrics`, {
        signal: AbortSignal.timeout(fetchTimeout),
      });
      if (!res.ok) {
        logger?.warn('chain-tip: block-proxy returned non-200', {
          status: res.status,
        });
        return;
      }
      const text = await res.text();
      const match = text.match(/^block_proxy_tip_height\s+(\d+)/m);
      if (!match) {
        logger?.warn('chain-tip: block_proxy_tip_height not found in response');
        return;
      }
      chainTipHeight.set(Number(match[1]));
    } catch (err) {
      logger?.warn('chain-tip: failed to fetch block-proxy metrics', err);
    }
  }

  // Self-scheduling setTimeout to prevent overlapping fetches
  let timer: ReturnType<typeof setTimeout>;

  async function poll(): Promise<void> {
    await fetchTip();
    timer = setTimeout(() => void poll(), intervalMs);
  }

  void poll();

  return {
    stop: () => clearTimeout(timer),
    chainTipHeight,
  };
}
