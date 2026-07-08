import { createHmac, timingSafeEqual } from 'node:crypto';

import 'server-only';

export const RPC_SESSION_COOKIE = 'rpc_session';
export const RPC_SESSION_TTL_MS = 30 * 60 * 1000;

const sign = (value: string, secret: string): string =>
  createHmac('sha256', secret)
    .update(`rpc-session:${value}`)
    .digest('base64url');

const hashIp = (ip: string, secret: string): string =>
  createHmac('sha256', secret)
    .update(`rpc-ip:${ip}`)
    .digest('base64url')
    .slice(0, 16);

export const getClientIp = (request: Request): string => {
  const forwarded = request.headers.get('x-forwarded-for');

  if (forwarded) return forwarded.split(',')[0].trim();

  return request.headers.get('x-real-ip') ?? 'unknown';
};

export const createSessionToken = (
  secret: string,
  ip: string,
): { expiresAt: number; token: string } => {
  const expiresAt = Date.now() + RPC_SESSION_TTL_MS;
  const value = `${expiresAt}.${hashIp(ip, secret)}`;

  return { expiresAt, token: `${value}.${sign(value, secret)}` };
};

export const verifySessionToken = (
  token: string,
  secret: string,
  ip: string,
): boolean => {
  const [expiry, ipHash, signature] = token.split('.');

  if (!expiry || !ipHash || !signature) return false;

  const expected = Buffer.from(sign(`${expiry}.${ipHash}`, secret));
  const received = Buffer.from(signature);

  if (
    expected.length !== received.length ||
    !timingSafeEqual(expected, received)
  ) {
    return false;
  }

  if (ipHash !== hashIp(ip, secret)) return false;

  return Number(expiry) > Date.now();
};
