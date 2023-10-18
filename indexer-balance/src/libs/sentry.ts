import '@sentry/tracing';
import * as Sentry from '@sentry/node';

import config from '#config';

Sentry.init({
  dsn: config.sentryDsn,
  tracesSampleRate: 1.0,
});

export default Sentry;
