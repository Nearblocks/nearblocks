import { z } from 'zod';

import config from '#config';
import logger from '#libs/logger';

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const VERIFY_TIMEOUT_MS = 10_000;

// Cloudflare returns more fields; we only need `success`.
const siteVerifyResponse = z.object({
  success: z.boolean(),
});

// Verify a Cloudflare Turnstile token against the siteverify endpoint.
// Mirrors the frontend pattern in apps/frontend/src/actions/contact.ts.
// Returns false (never throws) on timeout/network/parse failure so callers can
// answer with a clean rejection. The Turnstile secret is never logged.
const verifyTurnstile = async (
  token: string,
  remoteIp?: string,
): Promise<boolean> => {
  if (!config.turnstileSecretKey) {
    logger.error('turnstile: TURNSTILE_SECRET_KEY is not configured');

    return false;
  }

  const form = new URLSearchParams();
  form.append('secret', config.turnstileSecretKey);
  form.append('response', token);

  if (remoteIp) {
    form.append('remoteip', remoteIp);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      body: form.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      signal: controller.signal,
    });

    if (!response.ok) {
      logger.error(
        { status: response.status },
        'turnstile: siteverify returned a non-ok status',
      );

      return false;
    }

    const parsed = siteVerifyResponse.safeParse(await response.json());

    if (!parsed.success) {
      logger.error('turnstile: unexpected siteverify response shape');

      return false;
    }

    return parsed.data.success;
  } catch (error) {
    logger.error(
      { err: error },
      'turnstile: siteverify request failed or timed out',
    );

    return false;
  } finally {
    clearTimeout(timeout);
  }
};

export default verifyTurnstile;
