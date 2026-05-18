'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useConfig } from '@/hooks/use-config';

// TODO: remove this hardcoded fallback once NEXT_PUBLIC_FORMBRICKS_ENV_ID
// is set in deployment. This must be the Formbricks ENVIRONMENT ID
// (workspace-level), NOT a survey id. Find it at:
//   formbricks dashboard -> Settings -> API keys -> Environment ID
// Survey id `cmpb5wrl8448lvv01fx5acdw0` is wired by the `beta_feedback`
// Action in the dashboard, not used here.
const FALLBACK_FORMBRICKS_ENV_ID = 'cmpb5wdwz3vkdwd01j1rlmgbb';
const FALLBACK_FORMBRICKS_API_HOST = 'https://app.formbricks.com';

export const Formbricks = () => {
  const apiHost =
    useConfig((s) => s.config.formbricksApiHost) ??
    FALLBACK_FORMBRICKS_API_HOST;
  const environmentId =
    useConfig((s) => s.config.formbricksEnvId) || FALLBACK_FORMBRICKS_ENV_ID;
  const pathname = usePathname();

  useEffect(() => {
    if (!environmentId) {
      console.warn(
        'Formbricks env id not configured (NEXT_PUBLIC_FORMBRICKS_ENV_ID).',
      );
      return;
    }
    let cancelled = false;

    import('@formbricks/js')
      .then(async ({ default: formbricks }) => {
        if (cancelled) return;
        await formbricks.setup({ appUrl: apiHost, environmentId });
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
