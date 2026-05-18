'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useConfig } from '@/hooks/use-config';

export const Formbricks = () => {
  const apiHost = useConfig((s) => s.config.formbricksApiHost);
  const environmentId = useConfig((s) => s.config.formbricksEnvId);
  const pathname = usePathname();

  useEffect(() => {
    if (!environmentId) return;
    let cancelled = false;

    import('@formbricks/js')
      .then(({ default: formbricks }) => {
        if (cancelled) return;
        formbricks.setup({ appUrl: apiHost, environmentId });
      })
      .catch((err) => {
        console.warn('Formbricks init failed', err);
      });

    return () => {
      cancelled = true;
    };
  }, [apiHost, environmentId]);

  useEffect(() => {
    if (!environmentId || !pathname) return;
    import('@formbricks/js').then(({ default: formbricks }) => {
      formbricks.registerRouteChange();
    });
  }, [environmentId, pathname]);

  return null;
};
