import * as Sentry from '@sentry/node';

import config from '#config';

type SentryRequest = NonNullable<Sentry.Event['request']>;

// API keys can arrive in the query string or headers; never send them.
const scrubRequest = (request: SentryRequest): SentryRequest => {
  const {
    authorization: _authorization,
    'x-api-key': _apiKey,
    ...headers
  } = request.headers ?? {};
  return {
    ...request,
    cookies: undefined,
    headers,
    query_string: undefined,
    url: request.url?.split('?')[0],
  };
};

// Errors only (Sentry-compatible endpoint, e.g. Better Stack); no performance
// tracing, which would send an event per request. Off when SENTRY_DSN is unset.
Sentry.init({
  beforeSend: (event) =>
    event.request ? { ...event, request: scrubRequest(event.request) } : event,
  dsn: config.sentryDsn,
  enabled: !!config.sentryDsn,
  environment: config.network,
  release: process.env.GIT_SHA || undefined,
  sendDefaultPii: false,
  tracesSampleRate: 0,
});

export default Sentry;
