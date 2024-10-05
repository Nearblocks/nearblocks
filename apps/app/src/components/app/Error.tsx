import Head from 'next/head';

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
          </div>
          <div className="errorBg"></div>
        </div>
      </section>
    </>
  );
};

export default Error;
