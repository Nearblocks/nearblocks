import Head from 'next/head';
import Trans from 'next-translate/Trans';
import DynamicNamespaces from 'next-translate/DynamicNamespaces';
import Link from 'next/link';

export const Content = ({ i18nKey = '404:description' }) => {
  return (
    <DynamicNamespaces namespaces={['404']}>
      <div className="text-center text-black dark:text-neargray-10 text-2xl pt-10 top-4">
        <Trans i18nKey={i18nKey} components={[<strong key="1" />]} />
      </div>
      <div className="flex justify-center pt-12 z-10">
        <Link href="/" legacyBehavior>
          <a className="bg-button hover:bg-blue-500 text-white text-xs py-2 rounded focus:outline-none text-center px-3 w-auto">
            <Trans i18nKey="404:back" />
          </a>
        </Link>
      </div>
    </DynamicNamespaces>
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
