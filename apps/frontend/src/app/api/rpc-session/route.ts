import { NextResponse } from 'next/server';

import { getServerConfig } from '@/lib/config';
import {
  createSessionToken,
  getClientIp,
  RPC_SESSION_COOKIE,
} from '@/lib/rpc-auth';

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const POST = async (request: Request) => {
  const config = getServerConfig();

  let token: unknown;
  try {
    token = ((await request.json()) as { token?: unknown })?.token;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (typeof token !== 'string' || !token) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const clientIp = getClientIp(request);

  const formData = new URLSearchParams();
  formData.append('secret', config.TURNSTILE_SECRET_KEY);
  formData.append('response', token);
  if (clientIp !== 'unknown') {
    formData.append('remoteip', clientIp);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  let verification: Response;
  try {
    verification = await fetch(TURNSTILE_VERIFY_URL, {
      body: formData.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      signal: controller.signal,
    });
  } catch {
    return NextResponse.json(
      { error: 'Captcha verification service unavailable' },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeoutId);
  }

  let result: { hostname?: string; success: boolean };
  try {
    result = (await verification.json()) as {
      hostname?: string;
      success: boolean;
    };
  } catch {
    return NextResponse.json(
      { error: 'Captcha verification service unavailable' },
      { status: 502 },
    );
  }

  if (!result.success) {
    return NextResponse.json(
      { error: 'Captcha verification failed' },
      { status: 403 },
    );
  }

  // Only enforce the hostname match in production
  const expectedHost = (request.headers.get('host') ?? '').split(':')[0];
  if (
    process.env.NODE_ENV === 'production' &&
    result.hostname &&
    result.hostname !== expectedHost
  ) {
    return NextResponse.json(
      { error: 'Captcha verification failed' },
      { status: 403 },
    );
  }

  const session = createSessionToken(config.TURNSTILE_SECRET_KEY, clientIp);

  const response = NextResponse.json({ expiresAt: session.expiresAt });
  response.cookies.set(RPC_SESSION_COOKIE, session.token, {
    httpOnly: true,
    maxAge: Math.floor((session.expiresAt - Date.now()) / 1000),
    path: '/api/rpc',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
};
