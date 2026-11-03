import type { AppState } from '#state';

const METRICS_TIMEOUT_MS = 3_000;
const METRICS_CACHE_MS = 10_000;
// Healthy nodes keep a handful of unapplied flat-storage deltas; a stuck flat
// head (e.g. a hung per-epoch state snapshot) grows by one per block.
export const FLAT_STORAGE_MAX_DELTAS = 500;

export interface NodeMetrics {
  flat_storage_deltas: null | number;
  has_state_snapshot: boolean | null;
  head_lag_secs: null | number;
  peers: null | number;
}

export interface NodeStatus extends NodeMetrics {
  /** The node is current and its flat storage is keeping up. */
  healthy: boolean;
  /** Height of the node's last finalized head seen by the local indexer. */
  height: null | number;
  /** Age of that head block; the RPC guard rejects requests above the limit. */
  lag_secs: null | number;
  max_lag_secs: number;
}

const EMPTY_METRICS: NodeMetrics = {
  flat_storage_deltas: null,
  has_state_snapshot: null,
  head_lag_secs: null,
  peers: null,
};

/** Values of a Prometheus gauge across all its label sets. */
function samples(text: string, name: string): number[] {
  const values: number[] = [];
  for (const line of text.split('\n')) {
    if (!line.startsWith(name)) continue;
    const rest = line.slice(name.length);
    if (rest[0] !== ' ' && rest[0] !== '{') continue;
    const value = Number(rest.slice(rest.lastIndexOf(' ') + 1));
    if (Number.isFinite(value)) values.push(value);
  }
  return values;
}

export function parseNodeMetrics(text: string): NodeMetrics {
  const one = (name: string) => samples(text, name)[0] ?? null;
  const deltas = samples(text, 'near_flat_storage_cached_deltas');
  const snapshot = one('near_has_state_snapshot');
  return {
    flat_storage_deltas: deltas.length ? Math.max(...deltas) : null,
    has_state_snapshot: snapshot === null ? null : snapshot === 1,
    head_lag_secs: one('near_head_lag_seconds'),
    peers: one('near_peer_connections_total'),
  };
}

let cached: { at: number; metrics: NodeMetrics } | null = null;

/** neard serves /metrics on its RPC port; anything else yields nulls. */
async function nodeMetrics(rpcUrl: string): Promise<NodeMetrics> {
  if (cached && Date.now() - cached.at < METRICS_CACHE_MS)
    return cached.metrics;
  let metrics = EMPTY_METRICS;
  try {
    const response = await fetch(new URL('/metrics', rpcUrl), {
      signal: AbortSignal.timeout(METRICS_TIMEOUT_MS),
    });
    if (response.ok) metrics = parseNodeMetrics(await response.text());
  } catch {
    // Unreachable node: report unknowns; the lag check still applies.
  }
  cached = { at: Date.now(), metrics };
  return metrics;
}

export async function nodeStatus(state: AppState): Promise<NodeStatus | null> {
  const indexer = state.localIndexer;
  if (!indexer) return null;
  const metrics = await nodeMetrics(state.config.nodeRpcUrl);
  const deltasOk =
    metrics.flat_storage_deltas === null ||
    metrics.flat_storage_deltas <= FLAT_STORAGE_MAX_DELTAS;
  const lag = indexer.lagSecs();
  return {
    ...metrics,
    healthy: indexer.isNodeCurrent() && deltasOk,
    height: indexer.status.head || null,
    lag_secs: lag === null ? null : Math.round(lag),
    max_lag_secs: state.config.nodeMaxLagSecs,
  };
}
