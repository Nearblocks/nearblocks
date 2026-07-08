'use client';

import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useEffect, useRef } from 'react';

import { useConfig } from '@/hooks/use-config';
import { registerTurnstileExecutor } from '@/lib/rpc-session';

const EXECUTE_TIMEOUT_MS = 30 * 1000;

type Pending = {
  reject: (reason: Error) => void;
  resolve: (token: string) => void;
  timeoutId: ReturnType<typeof setTimeout>;
};

export const RpcSessionProvider = () => {
  const siteKey = useConfig((s) => s.config.turnstileSiteKey);
  const widget = useRef<TurnstileInstance | undefined>(undefined);
  const ready = useRef(false);
  const pending = useRef<null | Pending>(null);

  const settle = (action: 'reject' | 'resolve', value: Error | string) => {
    const current = pending.current;

    if (!current) return;

    pending.current = null;
    clearTimeout(current.timeoutId);

    if (action === 'resolve') current.resolve(value as string);
    else current.reject(value as Error);
  };

  const execute = () => {
    widget.current?.reset();
    widget.current?.execute();
  };

  useEffect(() => {
    registerTurnstileExecutor(
      () =>
        new Promise<string>((resolve, reject) => {
          settle('reject', new Error('Captcha request superseded'));

          pending.current = {
            reject,
            resolve,
            timeoutId: setTimeout(() => {
              settle('reject', new Error('Captcha timed out'));
            }, EXECUTE_TIMEOUT_MS),
          };

          if (ready.current) execute();
        }),
    );

    return () => registerTurnstileExecutor(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Turnstile
        onError={() => {
          settle('reject', new Error('Captcha verification failed'));
        }}
        onSuccess={(token) => {
          settle('resolve', token);
          // interaction-only widgets stay visible showing the solved state;
          // reset returns it to its dormant (hidden) state once we have the token.
          widget.current?.reset();
        }}
        onWidgetLoad={() => {
          ready.current = true;
          if (pending.current) execute();
        }}
        options={{
          appearance: 'interaction-only',
          execution: 'execute',
        }}
        ref={widget}
        siteKey={siteKey}
      />
    </div>
  );
};
