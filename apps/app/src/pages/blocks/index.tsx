import Head from 'next/head';
import Router, { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { networkId, appUrl } from '@/utils/config';
import List from '@/components/skeleton/common/List';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';

const ogUrl = env('NEXT_PUBLIC_OG_URL');
const network = env('NEXT_PUBLIC_NETWORK_ID');

const Blocks = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const components = useBosComponents();
  const { page } = router.query;

  const initialPage = page ? Number(page) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  const setPage = (pageNumber: number) => {
    Router.push(`/blocks?page=${pageNumber}`, undefined, { shallow: true });
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
  const thumbnail = `${ogUrl}/thumbnail/basic?title=${encodeURI(
    t('blocks:heading'),
  )}&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t(
            'blocks:metaTitle',
          )} `}
        </title>
        <meta name="title" content={t('blocks:metaTitle')} />
        <meta name="description" content={t('blocks:metaDescription')} />
        <meta property="og:title" content={t('blocks:metaTitle')} />
        <meta property="og:description" content={t('blocks:metaDescription')} />
        <meta property="twitter:title" content={t('blocks:metaTitle')} />
        <meta property="og:image" content={thumbnail} />
        <meta name="twitter:image" content={thumbnail} />
        <meta
          property="twitter:description"
          content={t('blocks:metaDescription')}
        />
        <link rel="canonical" href={`${appUrl}/blocks`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {t ? t('blocks:heading') : 'Latest Near Protocol Blocks'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div style={height} className=" relative block lg:flex lg:space-x-2">
          <div className="w-full ">
            <VmComponent
              skeleton={<List className="absolute" ref={heightRef} />}
              defaultSkelton={<List />}
              onChangeHeight={onChangeHeight}
              src={components?.blocksList}
              props={{
                currentPage: currentPage,
                setPage: setPage,
                network: networkId,
                t: t,
              }}
              loading={<List className="absolute" ref={heightRef} />}
            />
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
};

Blocks.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default Blocks;
