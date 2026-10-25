import { logger } from 'nb-logger';

import type { Config } from '#config';
import * as metrics from '#metrics';
import { UpstreamRedirectError } from '#types';
import type { BlockProxyUpstream, NeardataUpstream } from '#upstream/neardata';

// Only near-tip blocks are compared: that is where the node serves, and older
// heights are not held by a node proxy anyway.
const MAX_BEHIND_TIP = 100;
const MAX_IN_FLIGHT = 8;
// The shadow can trail the served source by a block or two at the tip.
const NOT_YET_RETRIES = 3;
const NOT_YET_DELAY_MS = 1000;
const MAX_DIFFS = 20;
const MAX_VALUE_CHARS = 200;

export type ShadowResult =
  | 'error'
  | 'match'
  | 'mismatch'
  | 'skipped'
  | 'unavailable';

/** A JSON number kept as its source text, so large integers compare exactly. */
class JsonNumber {
  constructor(readonly text: string) {}
}

export interface BlockDiff {
  path: string;
  served: string;
  shadow: string;
}

function parseExact(bytes: Buffer): unknown {
  return JSON.parse(bytes.toString('utf8'), ((
    _key: string,
    value: unknown,
    context?: { source?: string },
  ) =>
    typeof value === 'number'
      ? new JsonNumber(context?.source ?? String(value))
      : value) as never);
}

function show(value: unknown): string {
  if (value === undefined) return '<missing>';
  if (value instanceof JsonNumber) return value.text;
  const text = JSON.stringify(value, (_key, item: unknown) =>
    item instanceof JsonNumber ? Number(item.text) : item,
  );
  return text.length > MAX_VALUE_CHARS
    ? `${text.slice(0, MAX_VALUE_CHARS)}…`
    : text;
}

function kind(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof JsonNumber) return 'number';
  return typeof value;
}

/**
 * Differences between two JSON documents, ignoring object key order. Array
 * order and number text are significant. Returns at most MAX_DIFFS entries.
 */
export function diffBlocks(served: Buffer, shadow: Buffer): BlockDiff[] {
  const diffs: BlockDiff[] = [];
  const walk = (left: unknown, right: unknown, path: string): void => {
    if (diffs.length >= MAX_DIFFS) return;
    const leftKind = kind(left);
    if (left === undefined || right === undefined || leftKind !== kind(right)) {
      diffs.push({ path, served: show(left), shadow: show(right) });
      return;
    }
    if (left instanceof JsonNumber) {
      if (left.text !== (right as JsonNumber).text)
        diffs.push({ path, served: show(left), shadow: show(right) });
      return;
    }
    if (Array.isArray(left)) {
      const other = right as unknown[];
      if (left.length !== other.length)
        diffs.push({
          path: `${path}.length`,
          served: String(left.length),
          shadow: String(other.length),
        });
      for (let i = 0; i < Math.min(left.length, other.length); i++)
        walk(left[i], other[i], `${path}[${i}]`);
      return;
    }
    if (leftKind === 'object') {
      const leftRecord = left as Record<string, unknown>;
      const rightRecord = right as Record<string, unknown>;
      const keys = new Set([
        ...Object.keys(leftRecord),
        ...Object.keys(rightRecord),
      ]);
      for (const key of [...keys].sort())
        walk(leftRecord[key], rightRecord[key], `${path}.${key}`);
      return;
    }
    if (left !== right)
      diffs.push({ path, served: show(left), shadow: show(right) });
  };
  walk(parseExact(served), parseExact(shadow), '$');
  return diffs;
}

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Compares blocks served from the configured sources with the same height
 * fetched from a shadow source, without affecting the response. Used to prove
 * node-built blocks match neardata before serving them.
 */
export class ShadowComparator {
  readonly counts: Record<ShadowResult, number> = {
    error: 0,
    match: 0,
    mismatch: 0,
    skipped: 0,
    unavailable: 0,
  };
  lastMismatchHeight = 0;
  private inFlight = 0;

  constructor(
    private readonly source: 'neardata' | 'proxy',
    private readonly sampleRate: number,
    private readonly upstream: BlockProxyUpstream | NeardataUpstream,
    private readonly random: () => number = Math.random,
  ) {}

  static create(
    config: Config,
    upstreams: { neardata: NeardataUpstream; proxy: BlockProxyUpstream },
  ): null | ShadowComparator {
    if (!config.shadowSource) return null;
    return new ShadowComparator(
      config.shadowSource,
      config.shadowSampleRate,
      upstreams[config.shadowSource],
    );
  }

  /**
   * Schedule a comparison; never throws and never delays the caller. It runs
   * inside the fetch's promise callback, where a throw would surface as an
   * unhandled rejection and stop the process.
   */
  compare(
    height: number,
    bytes: Buffer,
    servedSource: string,
    tipHeight: number,
  ): void {
    try {
      this.schedule(height, bytes, servedSource, tipHeight);
    } catch (error) {
      logger.warn({ error: String(error), height }, 'shadow compare failed');
    }
  }

  private record(result: ShadowResult): void {
    try {
      this.counts[result]++;
      metrics.shadowComparisons.inc({ result, source: this.source });
    } catch {
      // Telemetry must never take the process down.
    }
  }

  private async run(
    height: number,
    served: Buffer,
    servedSource: string,
  ): Promise<ShadowResult> {
    let shadow: Buffer | null = null;
    for (let attempt = 0; ; attempt++) {
      try {
        const result = await this.upstream.fetchWithSource(height);
        // Only node-built blocks prove anything: a node proxy that fell back
        // to neardata would otherwise compare neardata with itself.
        if (this.source === 'proxy' && result.source !== 'node') {
          logger.debug(
            { height, upstreamSource: result.source },
            'shadow answer not built by the node',
          );
          return 'unavailable';
        }
        shadow = result.bytes;
        break;
      } catch (error) {
        // A redirect means the shadow does not hold the height itself.
        if (error instanceof UpstreamRedirectError) return 'unavailable';
        if (!(error as { notFound?: boolean }).notFound) {
          logger.warn(
            { error: String(error), height, source: this.source },
            'shadow fetch failed',
          );
          return 'error';
        }
        if (attempt >= NOT_YET_RETRIES) return 'unavailable';
        await sleep(NOT_YET_DELAY_MS);
      }
    }
    // Identical bytes are the normal case: no parsing on the event loop.
    if (served.equals(shadow)) return 'match';
    const diffs = diffBlocks(served, shadow);
    if (diffs.length === 0) return 'match';
    this.lastMismatchHeight = Math.max(this.lastMismatchHeight, height);
    metrics.shadowLastMismatchHeight.set(this.lastMismatchHeight);
    logger.error(
      {
        diffs,
        height,
        servedSource,
        shadowSource: this.source,
        truncated: diffs.length >= MAX_DIFFS,
      },
      'shadow block mismatch',
    );
    return 'mismatch';
  }

  private schedule(
    height: number,
    bytes: Buffer,
    servedSource: string,
    tipHeight: number,
  ): void {
    if (servedSource === this.source || servedSource === 'cache') return;
    if (
      height < tipHeight - MAX_BEHIND_TIP ||
      this.random() >= this.sampleRate ||
      this.inFlight >= MAX_IN_FLIGHT
    ) {
      this.record('skipped');
      return;
    }
    this.inFlight++;
    void this.run(height, bytes, servedSource)
      .then((result) => this.record(result))
      .catch((error: unknown) => {
        logger.warn({ error: String(error), height }, 'shadow compare failed');
        this.record('error');
      })
      .finally(() => {
        this.inFlight--;
      });
  }
}
