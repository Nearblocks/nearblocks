import Head from 'next/head';

import { Link } from '@/i18n/routing';

export const Content = () => {
  return (
    <>
      <div className="text-center text-black dark:text-neargray-10 text-2xl pt-10 top-4">
        Sorry! We encountered an unexpected error.
      </div>
      <div className="flex justify-center pt-12 z-10">
        <Link
          className="bg-button hover:bg-blue-500 text-white text-xs py-2 rounded focus:outline-none text-center px-3 w-auto"
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
          <div className="px-3 pt-12 errorContent absolute flex flex-col justify-center">
            <div className="text-center text-black dark:text-neargray-10 text-8xl pt-20 font-semibold">
              404
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
