import { getServerConfig } from '@/lib/config';

type Upstream = { token?: string; url: string };

export type RelayResult = { body: string; status: number };

// A node that lacks the block or is still syncing; another endpoint may answer.
const CANNOT_SERVE = /UNKNOWN_BLOCK|GARBAGE_COLLECTED_BLOCK|NOT_SYNCED_YET/;

const list = (value?: string) =>
  (value ?? '').split(',').map((item) => item.trim());

/**
 * RPC_UPSTREAM_URLS in priority order, with matching RPC_UPSTREAM_TOKENS.
 * RPC_UPSTREAM_URL and RPC_UPSTREAM_KEY are the older single-endpoint form.
 */
const upstreams = (): Upstream[] => {
  const config = getServerConfig();
  const urls = list(config.RPC_UPSTREAM_URLS).filter(Boolean);

  if (!urls.length) {
    if (!config.RPC_UPSTREAM_URL) throw new Error('Set RPC_UPSTREAM_URLS.');
    return [{ token: config.RPC_UPSTREAM_KEY, url: config.RPC_UPSTREAM_URL }];
  }

  const tokens = list(config.RPC_UPSTREAM_TOKENS);
  return urls.map((url, index) => ({ token: tokens[index] || undefined, url }));
};

/**
 * Relay a JSON-RPC body. Historical lookups go to RPC_UPSTREAM_ARCHIVAL_URL
 * when set; otherwise each upstream is tried in order until one answers.
 */
export const relayRpc = async (
  body: string,
  archival: boolean,
  timeoutMs = 10_000,
): Promise<RelayResult> => {
  const config = getServerConfig();
  const targets =
    archival && config.RPC_UPSTREAM_ARCHIVAL_URL
      ? [
          {
            token: config.RPC_UPSTREAM_ARCHIVAL_KEY ?? config.RPC_UPSTREAM_KEY,
            url: config.RPC_UPSTREAM_ARCHIVAL_URL,
          },
        ]
      : upstreams();

  let last: null | RelayResult = null;
  for (const [index, upstream] of targets.entries()) {
    try {
      const response = await fetch(upstream.url, {
        body,
        headers: {
          'Content-Type': 'application/json',
          ...(upstream.token
            ? { Authorization: `Bearer ${upstream.token}` }
            : {}),
        },
        method: 'POST',
        signal: AbortSignal.timeout(timeoutMs),
      });
      last = { body: await response.text(), status: response.status };
      const retry =
        response.status >= 500 ||
        [401, 403, 408, 429].includes(response.status) ||
        (last.body.includes('"error"') && CANNOT_SERVE.test(last.body));
      if (!retry || index === targets.length - 1) return last;
    } catch {
      // Unreachable or timed out: try the next upstream.
    }
    console.warn('using configured RPC fallback', { from: index + 1 });
  }

  if (last) return last;
  throw new Error('All RPC upstreams failed');
};
