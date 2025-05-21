import * as Sentry from '@sentry/nextjs';
import { env } from 'next-runtime-env';

const SENTRY_DSN_URL = env('NEXT_PUBLIC_SENTRY_DSN');

Sentry.init({
  dsn: SENTRY_DSN_URL,
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: 1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
