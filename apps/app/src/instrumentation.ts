import { registerOTel } from '@vercel/otel';

export async function register() {
  registerOTel({ serviceName: 'nearblocks-app' });
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
}
