import { logger } from 'nb-logger';

import type { Config } from '#config';
import * as metrics from '#metrics';
import { UpstreamRedirectError } from '#types';

const MAX_BODY_SIZE = 100 * 1024 * 1024;
const MAX_ERROR_BODY_SIZE = 16 * 1024;
const MAX_REDIRECTS = 3;
// The upstream proxy is first in line; neardata is the last resort and keeps
// being tried.
const PROXY_SOURCE_COOLDOWN_MS = 10_000;

/** Release response bodies that are not consumed. */
const discardBody = async (response: Response): Promise<void> => {
  try {
    await response.body?.cancel();
  } catch {
    // Cancellation may fail after the connection closes.
  }
};

async function readErrorBody(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (length < MAX_ERROR_BODY_SIZE) {
      const { done, value } = await reader.read();
      if (done) break;
      const remaining = MAX_ERROR_BODY_SIZE - length;
      const chunk = value.subarray(0, remaining);
      chunks.push(chunk);
      length += chunk.byteLength;
      if (chunk.byteLength < value.byteLength) break;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

function upstreamError(
  source: string,
  response: Response,
  body: string,
): Error & {
  body?: string;
  contentType?: string;
  notFound?: boolean;
  retryAfter?: string;
  source: string;
  status: number;
} {
  const error = new Error(
    `${source} returned error status: ${response.status}`,
  ) as Error & {
    body?: string;
    contentType?: string;
    notFound?: boolean;
    retryAfter?: string;
    source: string;
    status: number;
  };
  error.body = body;
  error.contentType = response.headers.get('content-type') ?? undefined;
  error.notFound = response.status === 404;
  error.retryAfter = response.headers.get('retry-after') ?? undefined;
  error.source = source;
  error.status = response.status;
  return error;
}

/** A failure that says the upstream is unreachable or broken, not a miss. */
function isUnavailable(error: unknown): boolean {
  if (error instanceof UpstreamRedirectError) return false;
  const status = (error as { status?: unknown } | null)?.status;
  return typeof status !== 'number' || status >= 500;
}

export class RemoteBlockUpstream {
  private unavailableUntil = 0;

  constructor(
    private readonly source: 'neardata' | 'proxy',
    private readonly baseUrl: string,
    private readonly timeoutMs: number,
    private readonly apiKey = '',
    private readonly keyMode: 'bearer' | 'query' = 'query',
    /**
     * After a timeout, connection failure or 5xx, skip this upstream for this
     * long, so a hung host does not cost a full timeout on every request.
     * 0 disables it.
     */
    private readonly cooldownMs = 0,
    /** Follow block redirects here instead of handing them to the caller. */
    private readonly followRedirects = false,
  ) {}

  async fetch(
    height: number,
    finality: 'final' | 'optimistic' = 'final',
  ): Promise<Buffer> {
    return (await this.fetchWithSource(height, finality)).bytes;
  }

  async fetchLastBlockHeight(
    finality: 'final' | 'optimistic' = 'final',
  ): Promise<number> {
    return this.guard(() => this.fetchHeadHeight(finality));
  }

  /** The block and the upstream's `X-Upstream-Source`, when it sends one. */
  async fetchWithSource(
    height: number,
    finality: 'final' | 'optimistic' = 'final',
  ): Promise<{ bytes: Buffer; source: null | string }> {
    return this.guard(() => this.fetchBlock(height, finality));
  }

  private buildUrl(path: string): string {
    const url = new URL(this.baseUrl);
    const basePath = url.pathname.replace(/\/+$/, '');
    const apiPath = path.startsWith('/v0/') ? path.slice(3) : path;
    url.pathname = basePath.endsWith('/v0')
      ? `${basePath}${apiPath}`
      : `${basePath}/v0${apiPath}`;
    if (
      this.apiKey &&
      this.keyMode === 'query' &&
      !url.searchParams.has('apiKey')
    ) {
      url.searchParams.set('apiKey', this.apiKey);
    }
    return url.toString();
  }

  private async fetchBlock(
    height: number,
    finality: 'final' | 'optimistic',
  ): Promise<{ bytes: Buffer; source: null | string }> {
    const suffix = finality === 'optimistic' ? '_opt' : '';
    let url = this.buildUrl(`/v0/block${suffix}/${height}`);
    const start = Date.now();
    // One deadline across redirect hops.
    const signal = AbortSignal.timeout(this.timeoutMs);
    let response: Response;
    for (let hops = 0; ; hops++) {
      response = await globalThis
        .fetch(url, { headers: this.headers(), redirect: 'manual', signal })
        .catch((err) => {
          throw new Error(
            `${this.source} request failed for block ${height}: ${err}`,
          );
        });
      if (response.status < 300 || response.status >= 400) break;

      const location = response.headers.get('location');
      await discardBody(response);
      if (!location) {
        throw new Error(
          `${this.source} returned redirect without a location for block ${height}`,
        );
      }
      if (!this.followRedirects)
        throw new UpstreamRedirectError(location, response.status);
      if (hops >= MAX_REDIRECTS) {
        throw new Error(
          `${this.source} redirected too many times for block ${height}`,
        );
      }
      url = this.redirectUrl(url, location);
    }

    if (response.status === 429) {
      metrics.upstreamRateLimited.inc({ source: this.source });
      logger.warn(
        {
          height,
          latency_ms: Date.now() - start,
          retry_after: response.headers.get('retry-after'),
          source: this.source,
          status: 429,
        },
        'block upstream rate limited',
      );
    }

    if (!response.ok) {
      const contentLength = Number(response.headers.get('content-length') ?? 0);
      const body =
        contentLength > MAX_ERROR_BODY_SIZE
          ? (await discardBody(response), '')
          : await readErrorBody(response);
      throw upstreamError(this.source, response, body);
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      await discardBody(response);
      throw new Error(
        `${this.source} response too large for block ${height}: ${contentLength} bytes`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_BODY_SIZE) {
      throw new Error(
        `${this.source} response body too large for block ${height}: ${arrayBuffer.byteLength} bytes`,
      );
    }

    const data = Buffer.from(arrayBuffer);
    logger.debug(
      {
        bytes: data.length,
        height,
        latency_ms: Date.now() - start,
        source: this.source,
        status: response.status,
      },
      'block upstream fetch complete',
    );
    return { bytes: data, source: response.headers.get('x-upstream-source') };
  }

  private async fetchHeadHeight(
    finality: 'final' | 'optimistic',
  ): Promise<number> {
    const url = this.buildUrl(`/v0/last_block/${finality}`);
    const response = await globalThis.fetch(url, {
      headers: this.headers(),
      redirect: 'manual',
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      await discardBody(response);
      if (!location)
        throw new Error(`${this.source} head redirect has no location`);
      const target = new URL(location, url);
      const match = target.pathname.match(/\/v0\/block(?:_opt)?\/(\d+)\/?$/);
      if (!match)
        throw new Error(`${this.source} head redirect has no block height`);
      const height = Number(match[1]);
      if (!Number.isSafeInteger(height))
        throw new Error(`${this.source} head height is not a safe integer`);
      return height;
    }
    if (response.status === 429) {
      metrics.upstreamRateLimited.inc({ source: this.source });
      logger.warn(
        {
          retry_after: response.headers.get('retry-after'),
          source: this.source,
        },
        'head upstream rate limited',
      );
    }
    if (!response.ok) {
      const body = await readErrorBody(response);
      throw upstreamError(this.source, response, body);
    }
    const contentLength = response.headers.get('content-length');
    if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
      await discardBody(response);
      throw new Error(
        `${this.source} head response too large: ${contentLength} bytes`,
      );
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > MAX_BODY_SIZE)
      throw new Error(
        `${this.source} head response too large: ${bytes.length} bytes`,
      );
    const value = JSON.parse(bytes.toString('utf8')) as {
      block?: { header?: { height?: number } };
    };
    const height = value.block?.header?.height;
    if (!Number.isSafeInteger(height) || height! < 0)
      throw new Error(`${this.source} last block has no valid height`);
    return height!;
  }

  private async guard<T>(request: () => Promise<T>): Promise<T> {
    if (this.cooldownMs && Date.now() < this.unavailableUntil)
      throw new Error(`${this.source} skipped after a recent failure`);
    try {
      const result = await request();
      this.unavailableUntil = 0;
      return result;
    } catch (error) {
      if (this.cooldownMs && isUnavailable(error))
        this.unavailableUntil = Date.now() + this.cooldownMs;
      throw error;
    }
  }

  private headers(): Record<string, string> | undefined {
    return this.apiKey && this.keyMode === 'bearer'
      ? { authorization: `Bearer ${this.apiKey}` }
      : undefined;
  }

  /**
   * Resolve a redirect target. The API key goes only to the upstream's own
   * host and its subdomains (neardata's archive hosts, e.g. a3.mainnet...).
   */
  private redirectUrl(from: string, location: string): string {
    const target = new URL(location, from);
    const baseHost = new URL(this.baseUrl).hostname;
    const trusted =
      target.hostname === baseHost || target.hostname.endsWith(`.${baseHost}`);
    if (
      trusted &&
      this.apiKey &&
      this.keyMode === 'query' &&
      !target.searchParams.has('apiKey')
    ) {
      target.searchParams.set('apiKey', this.apiKey);
    }
    return target.toString();
  }
}

export class NeardataUpstream extends RemoteBlockUpstream {
  constructor(config: Config) {
    super(
      'neardata',
      config.neardataBaseUrl,
      config.upstreamTimeoutMs,
      config.neardataApiKey,
      'query',
      0,
      // Historical blocks redirect to archive hosts; serve and cache them here.
      true,
    );
  }
}

export class BlockProxyUpstream extends RemoteBlockUpstream {
  constructor(config: Config) {
    super(
      'proxy',
      config.proxyUpstreamBaseUrl,
      config.upstreamTimeoutMs,
      config.proxyUpstreamApiKey,
      'bearer',
      PROXY_SOURCE_COOLDOWN_MS,
    );
  }
}
