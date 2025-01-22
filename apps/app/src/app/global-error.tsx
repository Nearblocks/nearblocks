'use client';

import Link from 'next/link';
import '@/styles/globals.css';
import '../../public/common.css';

export const Content = ({ reset }: any) => {
  return (
    <>
      <div className="text-center text-black dark:text-neargray-10 mt-4">
        Sorry, we encountered an unexpected error. Please try again later.
      </div>
      <div className="text-center text-black dark:text-neargray-10 mt-2">
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

  return (
    <html className="h-full">
      <head>
        <title>Error - Nearblocks</title>
      </head>
      <body className="h-full">
        <section className="flex flex-col items-center justify-center relative h-full bg-white dark:bg-nearblack">
          <div className="errorContainer h-screen flex flex-col items-center justify-center w-full">
            <div className="px-3 errorContent absolute flex flex-col justify-between">
              <div className="text-center text-black dark:text-neargray-10 text-3xl pt-28 font-semibold">
                Server Error
              </div>
              <Content reset={reset} />
            </div>
            <div className="globalErrorBg"></div>
          </div>
        </section>
      </body>
    </html>
  );
}
