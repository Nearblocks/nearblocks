import * as Sentry from '@sentry/nextjs';
import { env } from 'next-runtime-env';

const SENTRY_DSN_URL = env('NEXT_PUBLIC_SENTRY_DSN');

Sentry.init({
  dsn: SENTRY_DSN_URL,
  tracesSampleRate: 1,
});
