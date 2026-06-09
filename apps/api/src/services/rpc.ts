import { Request, Response } from 'express';

import config from '#config';
import catchAsync from '#libs/async';
import logger from '#libs/logger';
import {
  extractRpcId,
  isAllowedMethod,
  jsonRpcError,
  RPC_ERROR_CODE,
} from '#libs/rpc';
import { SESSION_TTL_MS, signSession } from '#libs/rpcSession';
import { Session } from '#libs/schema/rpc';
import verifyTurnstile from '#libs/turnstile';
import { RequestValidator } from '#types/types';

// Hard ceiling for a single upstream RPC round-trip.
const FORWARD_TIMEOUT_MS = 30_000;

// Forward the validated JSON-RPC body to a FastNear endpoint, injecting the
// server-only api key as a query param. The key is NEVER logged. The upstream
// JSON response (already a JSON-RPC envelope) is relayed verbatim with its
// status so the client parses FastNear's own result/error.
const forward = async (req: Request, res: Response, baseUrl: string) => {
  const method = (req.body as { method?: unknown } | undefined)?.method;

  // Double-guard: never forward a method the validator should have rejected.
  if (!isAllowedMethod(method)) {
    return res
      .status(400)
      .json(
        jsonRpcError(
          extractRpcId(req.body),
          RPC_ERROR_CODE.METHOD_NOT_FOUND,
          'Method not allowed',
        ),
      );
  }

  const target = config.fastnearRpcKey
    ? `${baseUrl}?apiKey=${config.fastnearRpcKey}`
    : baseUrl;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FORWARD_TIMEOUT_MS);

  try {
    const upstream = await fetch(target, {
      body: JSON.stringify(req.body),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      signal: controller.signal,
    });

    const payload = await upstream.text();

    res.status(upstream.status);
    res.setHeader('Content-Type', 'application/json');

    return res.send(payload);
  } catch (error) {
    // Log the method and error only — never the target URL (it carries the key).
    logger.error({ err: error, method }, 'rpc proxy: upstream request failed');

    return res
      .status(502)
      .json(
        jsonRpcError(
          extractRpcId(req.body),
          RPC_ERROR_CODE.INTERNAL_ERROR,
          'Upstream RPC unavailable',
        ),
      );
  } finally {
    clearTimeout(timeout);
  }
};

const proxy = catchAsync(async (req: Request, res: Response) =>
  forward(req, res, config.fastnearRpcUrl),
);

const archival = catchAsync(async (req: Request, res: Response) =>
  forward(req, res, config.fastnearArchivalRpcUrl),
);

// Phase 2: verify a Cloudflare Turnstile token and mint a short-lived session
// credential. Delivered in the JSON body; the client attaches it on subsequent
// proxy calls as the x-rpc-session header.
const session = catchAsync(
  async (req: RequestValidator<Session>, res: Response) => {
    const { token } = req.validator.data;
    const verified = await verifyTurnstile(token, req.ip);

    if (!verified) {
      return res.status(403).json({ message: 'Captcha verification failed' });
    }

    return res.status(200).json({
      expiresAt: Date.now() + SESSION_TTL_MS,
      token: signSession(),
    });
  },
);

export default { archival, proxy, session };
