import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId, appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Layout from '@/components/Layouts';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { env } from 'next-runtime-env';
import { useTheme } from 'next-themes';
import Skeleton from '@/components/skeleton/common/Skeleton';
import Delegator from '@/components/skeleton/node-explorer/Delegator';
const network = env('NEXT_PUBLIC_NETWORK_ID');
const Delegators = () => {
  const router = useRouter();
  const { id } = router.query;
  const components = useBosComponents();
  const { t } = useTranslation();
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  const { page } = router.query;
  const initialPage = page ? Number(page) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const { theme } = useTheme();
  const title = `${network === 'testnet' ? 'TESTNET ' : ''}${
    id ? `${id}: ` : ''
  } delegators | NearBlocks`;
  const description = id
    ? `Node Validator ${id} (${id}) Delegators Listing`
    : '';
  const setPage = (pageNumber: number) => {
    Router.push(`/node-explorer/${id}?page=${pageNumber}`, undefined, {
      shallow: true,
    });
    setCurrentPage(pageNumber);
  };
  useEffect(() => {
    setCurrentPage(page ? Number(page) : 1);
  }, [page]);
  const updateOuterDivHeight = () => {
    if (heightRef.current) {
      const Height = heightRef.current.offsetHeight;
      setHeight({ height: Height });
    } else {
      setHeight({});
    }
  };
  useEffect(() => {
    updateOuterDivHeight();
    window.addEventListener('resize', updateOuterDivHeight);
    return () => {
      window.removeEventListener('resize', updateOuterDivHeight);
    };
  }, []);
  const onChangeHeight = () => {
    setHeight({});
  };
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
                        <VmComponent
                          src={components?.buttons}
                          props={{
                            id: id,
                            theme: theme,
                          }}
                        />
                      </span>
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
        <div style={height}>
          <VmComponent
            src={components?.delegators}
            skeleton={<Delegator className="absolute" ref={heightRef} />}
            defaultSkelton={<Delegator className="ml-3" />}
            onChangeHeight={onChangeHeight}
            props={{
              accountId: id,
              currentPage: currentPage,
              setPage: setPage,
              network: networkId,
              theme: theme,
              t: t,
            }}
            loading={<Delegator className="absolute" ref={heightRef} />}
          />
        </div>
      </div>
    </>
  );
};
Delegators.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default Delegators;
