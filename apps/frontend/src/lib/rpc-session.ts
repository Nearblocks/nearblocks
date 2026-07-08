export type TurnstileExecutor = () => Promise<string>;

// JSON-RPC error code returned by /api/rpc when the session cookie is missing/expired
export const RPC_SESSION_ERROR_CODE = -32001;

// Refresh slightly before the cookie expires so in-flight calls don't 401
const EXPIRY_MARGIN_MS = 60 * 1000;

let expiresAt = 0;
let executor: null | TurnstileExecutor = null;
let refreshing: null | Promise<void> = null;

export const isProxyProvider = (url: string) => url.startsWith('/');

export const registerTurnstileExecutor = (fn: null | TurnstileExecutor) => {
  executor = fn;
};

const refresh = async (): Promise<void> => {
  if (!executor) {
    throw new Error('Captcha is not ready yet');
  }

  const token = await executor();

  const res = await fetch('/api/rpc-session', {
    body: JSON.stringify({ token }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error('Failed to create RPC session');
  }

  const data = (await res.json()) as { expiresAt: number };
  expiresAt = data.expiresAt;
};

export const ensureRpcSession = (force = false): Promise<void> => {
  if (refreshing) return refreshing;

  if (!force && Date.now() < expiresAt - EXPIRY_MARGIN_MS) {
    return Promise.resolve();
  }

  refreshing = refresh().finally(() => {
    refreshing = null;
  });

  return refreshing;
};
