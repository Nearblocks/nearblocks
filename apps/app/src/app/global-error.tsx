'use client';

import { PublicEnvProvider } from 'next-runtime-env';
import ErrorLayout from './ErrorLayout';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import '@/styles/globals.css';
import '@/styles/common.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.log(error);
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <head>
        <title>Error - Nearblocks</title>
      </head>
      <body>
        <>
          <PublicEnvProvider>
            <ErrorLayout reset={reset} />
          </PublicEnvProvider>
        </>
      </body>
    </html>
  );
}
