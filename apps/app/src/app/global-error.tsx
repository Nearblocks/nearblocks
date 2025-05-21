'use client';

import Link from 'next/link';
import '@/styles/globals.css';
import '../../public/common.css';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export const Content = ({ reset }: any) => {
  return (
    <>
      <div className="text-center text-nearblue-600 dark:text-neargray-10 mt-4">
        Sorry, we encountered an unexpected error. Please try again later.
      </div>
      <div className="text-center text-nearblue-600 dark:text-neargray-10 mt-2">
        If you think this is a problem,{' '}
        <Link
          className="text-green-100 hover:text-green-200 underline"
          href="/contact"
        >
          please tell us
        </Link>
      </div>
      <div className="flex justify-center pt-8 z-10">
        <button
          className="bg-green-500 dark:bg-green-250 hover:bg-green-200 text-white text-xs py-2 rounded focus:outline-none text-center px-3 w-auto"
          onClick={() => reset()}
        >
          Refresh
        </button>
      </div>
    </>
  );
};

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
        <section className="flex flex-col items-center justify-center relative">
          <div className="globalErrorContainer flex flex-col items-center justify-end">
            <div className="px-3 errorContent absolute flex flex-col justify-center">
              <div className="text-center text-nearblue-600 dark:text-neargray-10 text-3xl pt-20 font-semibold">
                Server Error{' '}
              </div>
              <Content reset={reset} />
            </div>
            <div className="errorBg"></div>
          </div>
        </section>
      </body>
    </html>
  );
}
