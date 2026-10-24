import * as Sentry from '@sentry/node';

import config from '#config';

Sentry.init({
  dsn: config.sentryDsn,
  integrations: [...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations()],
  tracesSampleRate: 1.0,
});

export default Sentry;
