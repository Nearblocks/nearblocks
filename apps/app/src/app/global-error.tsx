'use client';

import { PublicEnvProvider } from 'next-runtime-env';
import ErrorLayout from './ErrorLayout';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Global error:', error);

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
