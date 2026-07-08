import { NextRequest, NextResponse } from 'next/server';

import { getServerConfig } from '@/lib/config';
import {
  getClientIp,
  RPC_SESSION_COOKIE,
  verifySessionToken,
} from '@/lib/rpc-auth';
import { RPC_SESSION_ERROR_CODE } from '@/lib/rpc-session';

const ALLOWED_METHODS = new Set([
  'EXPERIMENTAL_protocol_config',
  'EXPERIMENTAL_tx_status',
  'query',
  'validators',
]);

const MAX_BODY_BYTES = 10_000;
const RATE_LIMIT = 300; // requests per window, per session
const RATE_WINDOW_MS = 60 * 1000;

const buckets = new Map<string, { count: number; resetAt: number }>();

const isRateLimited = (key: string): boolean => {
  const now = Date.now();

  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) {
      if (v.resetAt < now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  bucket.count += 1;

  return bucket.count > RATE_LIMIT;
};

const rpcError = (id: unknown, status: number, code: number, message: string) =>
  NextResponse.json(
    { error: { code, message }, id: id ?? 'dontcare', jsonrpc: '2.0' },
    { status },
  );

export const POST = async (request: NextRequest) => {
  const config = getServerConfig();
  const session = request.cookies.get(RPC_SESSION_COOKIE)?.value;

  if (
    !session ||
    !verifySessionToken(
      session,
      config.TURNSTILE_SECRET_KEY,
      getClientIp(request),
    )
  ) {
    return rpcError(null, 401, RPC_SESSION_ERROR_CODE, 'RPC session required');
  }

  if (isRateLimited(session)) {
    return rpcError(null, 429, -32005, 'Too many requests');
  }

  const raw = await request.text();

  if (raw.length > MAX_BODY_BYTES) {
    return rpcError(null, 400, -32600, 'Request too large');
  }

  let body: { id?: unknown; method?: unknown; params?: unknown };
  try {
    body = JSON.parse(raw) as {
      id?: unknown;
      method?: unknown;
      params?: unknown;
    };
  } catch {
    return rpcError(null, 400, -32700, 'Parse error');
  }

  if (typeof body?.method !== 'string' || !ALLOWED_METHODS.has(body.method)) {
    return rpcError(body?.id, 400, -32601, 'Method not allowed');
  }

  // Historical lookups need an archival node
  const needsArchival =
    body.method === 'EXPERIMENTAL_tx_status' ||
    (body.method === 'query' &&
      typeof body.params === 'object' &&
      body.params !== null &&
      'block_id' in body.params);

  const upstreamUrl =
    needsArchival && config.RPC_UPSTREAM_ARCHIVAL_URL
      ? config.RPC_UPSTREAM_ARCHIVAL_URL
      : config.RPC_UPSTREAM_URL;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.RPC_UPSTREAM_KEY) {
    headers.Authorization = `Bearer ${config.RPC_UPSTREAM_KEY}`;
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      body: raw,
      headers,
      method: 'POST',
    });
  } catch {
    return rpcError(body?.id, 502, -32603, 'Upstream RPC unavailable');
  }

  return new NextResponse(upstream.body, {
    headers: { 'Content-Type': 'application/json' },
    status: upstream.status,
  });
};
