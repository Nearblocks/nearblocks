import { logger } from 'nb-logger';

import type { Config } from '#config';

const MAX_BODY_SIZE = 100 * 1024 * 1024; // 100 MB

export class FastnearUpstream {
  private apiKey: string;
  private baseUrl: string;
  private timeoutMs: number;

  constructor(config: Config) {
    this.apiKey = config.fastnearApiKey;
    this.baseUrl = config.fastnearBaseUrl;
    this.timeoutMs = config.upstreamTimeoutMs;
  }

  private buildUrl(path: string): string {
    const url = `${this.baseUrl}${path}`;
    return this.apiKey ? `${url}?apiKey=${this.apiKey}` : url;
  }

  async fetch(height: number): Promise<Buffer> {
    const url = this.buildUrl(`/v0/block/${height}`);
    const start = Date.now();

    const response = await globalThis
      .fetch(url, { signal: AbortSignal.timeout(this.timeoutMs) })
      .catch((err) => {
        throw new Error(`fastnear request failed for block ${height}: ${err}`);
      });

    if (response.status === 404) {
      const err = new Error(
        `block ${height} not found on fastnear`,
      ) as Error & { notFound: boolean };
      err.notFound = true;
      throw err;
    }

    if (!response.ok) {
      throw new Error(
        `fastnear returned error status for block ${height}: ${response.status}`,
      );
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      throw new Error(
        `fastnear response too large for block ${height}: ${contentLength} bytes`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BODY_SIZE) {
      throw new Error(
        `fastnear response body too large for block ${height}: ${arrayBuffer.byteLength} bytes`,
      );
    }

    const data = Buffer.from(arrayBuffer);
    const elapsed = Date.now() - start;
    logger.debug(
      {
        bytes: data.length,
        height,
        latency_ms: elapsed,
        status: response.status,
      },
      'fastnear upstream fetch complete',
    );

    return data;
  }

  async fetchLastBlockFinal(): Promise<Buffer> {
    const url = this.buildUrl('/v0/last_block/final');
    const start = Date.now();

    const response = await globalThis
      .fetch(url, { signal: AbortSignal.timeout(this.timeoutMs) })
      .catch((err) => {
        throw new Error(`fastnear last_block/final request failed: ${err}`);
      });

    if (response.status === 404) {
      throw new Error('last_block/final not found on fastnear');
    }

    if (!response.ok) {
      throw new Error(
        `fastnear returned error status for last_block/final: ${response.status}`,
      );
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      throw new Error(
        `fastnear response too large for last_block/final: ${contentLength} bytes`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BODY_SIZE) {
      throw new Error(
        `fastnear response body too large for last_block/final: ${arrayBuffer.byteLength} bytes`,
      );
    }

    const data = Buffer.from(arrayBuffer);
    const elapsed = Date.now() - start;
    logger.debug(
      { bytes: data.length, latency_ms: elapsed, status: response.status },
      'fastnear last_block/final fetch complete',
    );

    return data;
  }
}
