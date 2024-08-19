import Head from 'next/head';
import { useRouter } from 'next/router';
import { appUrl } from '@/utils/config';
import Layout from '@/components/Layouts';
import { ReactElement } from 'react';
import { env } from 'next-runtime-env';
import Skeleton from '@/components/skeleton/common/Skeleton';
import Buttons from '@/components/Address/Buttons';
import Delegators from '@/components/NodeExplorer/Delegators';

const network = env('NEXT_PUBLIC_NETWORK_ID');

const Delegator = () => {
  const router = useRouter();
  const { id }: any = router.query;

  const title = `${network === 'testnet' ? 'TESTNET ' : ''}${
    id ? `${id}: ` : ''
  } delegators | NearBlocks`;
  const description = id
    ? `Node Validator ${id} (${id}) Delegators Listing`
    : '';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <link rel="canonical" href={`${appUrl}/node-explorer/${id}`} />
      </Head>
      <div className="container relative mx-auto p-3">
        <div className="md:flex justify-between">
          {!id ? (
            <div className="w-80 max-w-xs px-3 py-5">
              <Skeleton className="h-7" />
            </div>
          ) : (
            <div className="md:flex-wrap">
              <div className="break-words py-4 px-2">
                <span className="py-5 text-xl text-gray-700 leading-8 dark:text-neargray-10 mr-1">
                  <span className="whitespace-nowrap">
                    Near Validator:&nbsp;
                  </span>
                  {id && (
                    <span className="text-center items-center">
                      <span className="text-green-500 dark:text-green-250">
                        @<span className="font-semibold">{id}</span>
                      </span>
                      <span className="ml-2">
                        <Buttons address={id} />
                      </span>
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
        <div>
          <Delegators accountId={id} />
        </div>
      </div>
    </>
  );
};
Delegator.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default Delegator;
