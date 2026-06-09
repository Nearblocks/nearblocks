'use client';

import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useCallback, useEffect, useRef } from 'react';

import { useConfig } from '@/hooks/use-config';
import { useSession } from '@/hooks/use-session';
import { cn } from '@/lib/utils';

const SESSION_PATH = '/v1/rpc/session';
// Re-mint the short-lived session credential a minute before it expires so the
// transition is silent and never flashes the interactive overlay.
const REMINT_LEAD_MS = 60_000;
// After a mint/challenge failure, retry the widget on a fixed backoff so the
// gate self-recovers (Turnstile does not auto-retry on error) instead of leaving
// RPC permanently gated until a full page reload.
const RETRY_BACKOFF_MS = 5_000;

type SessionResponse = {
  expiresAt: number;
  token: string;
};

/**
 * Root-level, headless Turnstile gate. Silent by default (interaction-only
 * appearance): on load it mints an RPC proxy session invisibly. It only reveals
 * a full-screen overlay when Cloudflare requires an interactive challenge, and
 * GATES (keeps RPC hooks loading) rather than degrading to a public provider on
 * failure. Renders nothing when the Phase-2 flag is off.
 */
export const SessionGate = () => {
  const enforced = useConfig((s) => s.config.rpcSessionEnforced);
  const proxyBase = useConfig((s) => s.config.rpcProxyUrl);
  const siteKey = useConfig((s) => s.config.turnstileSiteKey);

  const status = useSession((s) => s.status);
  const expiresAt = useSession((s) => s.expiresAt);
  const setToken = useSession((s) => s.setToken);
  const setStatus = useSession((s) => s.setStatus);
  const reset = useSession((s) => s.reset);

  const widgetRef = useRef<TurnstileInstance | undefined>(undefined);

  const mintSession = useCallback(
    async (turnstileToken: string) => {
      setStatus('minting');

      try {
        const res = await fetch(`${proxyBase}${SESSION_PATH}`, {
          body: JSON.stringify({ token: turnstileToken }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });

        if (!res.ok) {
          setStatus('error');
          return;
        }

        const data = (await res.json()) as Partial<SessionResponse>;

        if (
          typeof data.token !== 'string' ||
          typeof data.expiresAt !== 'number'
        ) {
          setStatus('error');
          return;
        }

        setToken(data.token, data.expiresAt);
      } catch (error) {
        // Never swallow silently: surface for diagnostics, then GATE (the RPC
        // hooks stay in a loading state) instead of degrading to a public RPC.
        console.error('Failed to mint RPC session', error);
        setStatus('error');
      }
    },
    [proxyBase, setStatus, setToken],
  );

  useEffect(() => {
    if (!enforced || !expiresAt) return;

    const delay = Math.max(expiresAt - Date.now() - REMINT_LEAD_MS, 0);
    const timer = setTimeout(() => widgetRef.current?.reset(), delay);

    return () => clearTimeout(timer);
  }, [enforced, expiresAt]);

  useEffect(() => {
    if (!enforced || status !== 'error') return;

    const timer = setTimeout(
      () => widgetRef.current?.reset(),
      RETRY_BACKOFF_MS,
    );

    return () => clearTimeout(timer);
  }, [enforced, status]);

  if (!enforced) return null;

  const challenging = status === 'challenge';

  return (
    <div
      aria-modal={challenging || undefined}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        challenging ? 'bg-black/50' : 'pointer-events-none',
      )}
      role={challenging ? 'dialog' : undefined}
    >
      <div
        className={cn(
          challenging
            ? 'bg-popover flex flex-col items-center gap-4 rounded-lg border p-6 shadow-lg'
            : 'sr-only',
        )}
      >
        {challenging ? (
          <div className="flex flex-col gap-2 text-center">
            <p className="text-body-lg leading-none">Verifying your browser</p>
            <p className="text-muted-foreground text-body-sm">
              Complete the check below to continue loading on-chain data.
            </p>
          </div>
        ) : null}
        <Turnstile
          onAfterInteractive={() => setStatus('minting')}
          onBeforeInteractive={() => setStatus('challenge')}
          onError={() => setStatus('error')}
          onExpire={() => {
            reset();
            widgetRef.current?.reset();
          }}
          onSuccess={(token) => void mintSession(token)}
          options={{ appearance: 'interaction-only' }}
          ref={widgetRef}
          siteKey={siteKey}
        />
      </div>
    </div>
  );
};
