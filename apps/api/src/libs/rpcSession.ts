import { createHmac, timingSafeEqual } from 'node:crypto';

import { z } from 'zod';

import config from '#config';

// Short-lived (~30 min) anti-abuse session credential issued after a successful
// Turnstile verification. This is bot-friction, NOT authentication: it is an
// HMAC-signed expiry stamp, stateless and self-contained.
//
// Token format: base64url(JSON payload) + '.' + base64url(HMAC-SHA256(payload)).

export const SESSION_TTL_MS = 30 * 60 * 1000;

const payloadSchema = z.object({
  exp: z.number(),
});

const b64url = (input: string): string =>
  Buffer.from(input, 'utf8').toString('base64url');

const sign = (payloadB64: string): string =>
  createHmac('sha256', config.rpcSessionSecret)
    .update(payloadB64)
    .digest('base64url');

// Mint a fresh signed session token valid for SESSION_TTL_MS.
export const signSession = (): string => {
  const payloadB64 = b64url(
    JSON.stringify({ exp: Date.now() + SESSION_TTL_MS }),
  );

  return `${payloadB64}.${sign(payloadB64)}`;
};

// Verify a session token: signature (timing-safe) + not expired. Returns false
// on any malformed/expired/forged input, and when the secret is unset (so the
// feature fails closed rather than accepting unsigned tokens).
export const verifySession = (token: string): boolean => {
  if (!config.rpcSessionSecret || !token) {
    return false;
  }

  const parts = token.split('.');

  if (parts.length !== 2) {
    return false;
  }

  const [payloadB64, signature] = parts;
  const expected = sign(payloadB64);
  const signatureBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);

  if (
    signatureBuf.length !== expectedBuf.length ||
    !timingSafeEqual(signatureBuf, expectedBuf)
  ) {
    return false;
  }

  try {
    const parsed = payloadSchema.safeParse(
      JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')),
    );

    return parsed.success && parsed.data.exp > Date.now();
  } catch {
    return false;
  }
};
