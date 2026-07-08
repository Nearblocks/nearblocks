'use client';

import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { useEffect, useRef } from 'react';

import { useConfig } from '@/hooks/use-config';
import { registerTurnstileExecutor } from '@/lib/rpc-session';

type Pending = {
  reject: (reason: Error) => void;
  resolve: (token: string) => void;
};

export const RpcSessionProvider = () => {
  const siteKey = useConfig((s) => s.config.turnstileSiteKey);
  const widget = useRef<TurnstileInstance | undefined>(undefined);
  const pending = useRef<null | Pending>(null);

  useEffect(() => {
    registerTurnstileExecutor(
      () =>
        new Promise<string>((resolve, reject) => {
          pending.current?.reject(new Error('Captcha request superseded'));
          pending.current = { reject, resolve };
          widget.current?.reset();
          widget.current?.execute();
        }),
    );

    return () => registerTurnstileExecutor(null);
  }, []);

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Turnstile
        onError={() => {
          pending.current?.reject(new Error('Captcha verification failed'));
          pending.current = null;
        }}
        onSuccess={(token) => {
          pending.current?.resolve(token);
          pending.current = null;
          // interaction-only widgets stay visible showing the solved state;
          // reset returns it to its dormant (hidden) state once we have the token.
          widget.current?.reset();
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
