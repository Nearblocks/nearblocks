import Head from 'next/head';

import { Link } from '@/i18n/routing';

export const Content = () => {
  return (
    <>
      <div className="text-center text-nearblue-600 dark:text-neargray-10 mt-4">
        The requested URL was not found on this server.
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
        <Link
          className="bg-green-500 dark:bg-green-250 hover:bg-green-200 text-white text-xs py-2 rounded focus:outline-none text-center px-3 w-auto"
          href="/"
        >
          Go back home
        </Link>
      </div>
    </>
  );
};

const Error = () => {
  return (
    <>
      <section className="flex flex-col items-center justify-center relative h-full">
        <Head>
          <title>NearBlocks - Page not Found </title>
        </Head>
        <div className="errorContainer flex flex-col items-center justify-center">
          <div className="px-3  errorContent absolute flex flex-col justify-center">
            <div className="text-center text-nearblue-600 dark:text-neargray-10 text-3xl pt-20 font-semibold">
              Page not found
            </div>
            {<Content />}
          </div>
          <div className="errorBg"></div>
        </div>
      </section>
    </>
  );
};

export default Error;
