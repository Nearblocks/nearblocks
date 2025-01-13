import * as Sentry from '@sentry/node';
import '@sentry/tracing';

import config from '#config';

Sentry.init({
  dsn: config.sentryDsn,
  tracesSampleRate: 1.0,
});

export default Sentry;
