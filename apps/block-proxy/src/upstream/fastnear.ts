import { logger } from 'nb-logger';

import type { UpstreamConfig } from '#config';
import * as metrics from '#metrics';
import type { UpstreamFetchError } from '#types';

const MAX_BODY_SIZE = 100 * 1024 * 1024; // 100 MB

/**
 * undici keeps a connection checked out until its body is read or cancelled.
 * Used where the body size is unknown; small 404 bodies are reclaimed anyway.
 */
const discardBody = async (response: Response): Promise<void> => {
  try {
    await response.body?.cancel();
  } catch {
    // Already consumed, or the socket is gone. Nothing left to release.
  }
};

/** `Retry-After` is either delta-seconds or an HTTP date. */
const parseRetryAfter = (header: null | string): number | undefined => {
  if (!header) return undefined;

  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;

  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());

  return undefined;
};

/**
 * One neardata-compatible endpoint. That is either FastNear itself or another
 * block-proxy instance, which serves the same two paths — so the only
 * difference is the base URL and whether an API key is attached.
 */
export class FastnearUpstream {
  private apiKey: string;

  private baseUrl: string;
  private timeoutMs: number;
  readonly name: string;

  constructor(upstream: UpstreamConfig, timeoutMs: number) {
    this.apiKey = upstream.apiKey;
    this.baseUrl = upstream.url;
    this.name = upstream.name;
    this.timeoutMs = timeoutMs;
  }

  private buildUrl(path: string): string {
    const url = `${this.baseUrl}${path}`;
    return this.apiKey
      ? `${url}?apiKey=${encodeURIComponent(this.apiKey)}`
      : url;
  }

  /** Records the 429 and tags the error so the pool can apply a cooldown. */
  private rateLimited(
    response: Response,
    start: number,
    height?: number,
  ): void {
    metrics.upstreamRateLimited.inc({ source: this.name });
    logger.warn(
      {
        height,
        latency_ms: Date.now() - start,
        retry_after: response.headers.get('retry-after'),
        source: this.name,
        status: 429,
      },
      'upstream rate limited',
    );
  }

  private statusError(response: Response, message: string): UpstreamFetchError {
    const err = new Error(message) as UpstreamFetchError;
    err.status = response.status;
    err.retryAfterMs = parseRetryAfter(response.headers.get('retry-after'));
    return err;
  }

  async fetch(height: number): Promise<Buffer> {
    const url = this.buildUrl(`/v0/block/${height}`);
    const start = Date.now();

    const response = await globalThis
      .fetch(url, { signal: AbortSignal.timeout(this.timeoutMs) })
      .catch((err) => {
        throw new Error(
          `${this.name} request failed for block ${height}: ${err}`,
        );
      });

    if (response.status === 404) {
      const err = new Error(
        `block ${height} not found on ${this.name}`,
      ) as UpstreamFetchError;
      err.notFound = true;
      err.status = 404;
      throw err;
    }

    if (response.status === 429) {
      this.rateLimited(response, start, height);
    }

    if (!response.ok) {
      await discardBody(response);
      throw this.statusError(
        response,
        `${this.name} returned error status for block ${height}: ${response.status}`,
      );
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      await discardBody(response);
      throw new Error(
        `${this.name} response too large for block ${height}: ${contentLength} bytes`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BODY_SIZE) {
      throw new Error(
        `${this.name} response body too large for block ${height}: ${arrayBuffer.byteLength} bytes`,
      );
    }

    const data = Buffer.from(arrayBuffer);
    const elapsed = Date.now() - start;
    logger.debug(
      {
        bytes: data.length,
        height,
        latency_ms: elapsed,
        source: this.name,
        status: response.status,
      },
      'upstream fetch complete',
    );

    return data;
  }

  async fetchLastBlockFinal(): Promise<Buffer> {
    const url = this.buildUrl('/v0/last_block/final');
    const start = Date.now();

    const response = await globalThis
      .fetch(url, { signal: AbortSignal.timeout(this.timeoutMs) })
      .catch((err) => {
        throw new Error(`${this.name} last_block/final request failed: ${err}`);
      });

    if (response.status === 404) {
      const err = new Error(
        `last_block/final not found on ${this.name}`,
      ) as UpstreamFetchError;
      err.notFound = true;
      err.status = 404;
      throw err;
    }

    if (response.status === 429) {
      this.rateLimited(response, start);
    }

    if (!response.ok) {
      await discardBody(response);
      throw this.statusError(
        response,
        `${this.name} returned error status for last_block/final: ${response.status}`,
      );
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      await discardBody(response);
      throw new Error(
        `${this.name} last_block/final response too large: ${contentLength} bytes`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BODY_SIZE) {
      throw new Error(
        `${this.name} last_block/final response body too large: ${arrayBuffer.byteLength} bytes`,
      );
    }

    const data = Buffer.from(arrayBuffer);
    logger.debug(
      {
        bytes: data.length,
        latency_ms: Date.now() - start,
        source: this.name,
        status: response.status,
      },
      'upstream last_block/final fetch complete',
    );

    return data;
  }
}
