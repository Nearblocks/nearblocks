import Head from 'next/head';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId, appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Router, { useRouter } from 'next/router';
import List from '@/components/skeleton/common/List';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';

const network = env('NEXT_PUBLIC_NETWORK_ID');
const ogUrl = env('NEXT_PUBLIC_OG_URL');

const TopFTTokens = () => {
  const router = useRouter();
  const components = useBosComponents();
  const { page } = router.query;
  const { t } = useTranslation();
  const initialPage = page ? Number(page) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  const setPage = (pageNumber: number) => {
    Router.push(`/tokens?page=${pageNumber}`, undefined, { shallow: true });
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
  const thumbnail = `${ogUrl}/thumbnail/basic?title=Near%20Protocol%20NEP-141%20Tokens&brand=near`;

  return (
    <>
      <Head>
        <title>
          {`${
            network === 'testnet' ? 'TESTNET' : ''
          } Near Protocol Ecosystem Tokens (NEP-141) | NearBlocks`}
        </title>
        <meta
          name="title"
          content="Near Protocol Ecosystem Tokens (NEP-141) | NearBlocks"
        />
        <meta
          name="description"
          content="A curated list of all NEP-141 Tokens within the Near Protocol Ecoystem. Discover statistics, holders, transaction volume and more."
        />
        <meta
          property="og:title"
          content="Near Protocol Ecosystem Tokens (NEP-141) | NearBlocks"
        />
        <meta
          property="og:description"
          content="A curated list of all NEP-141 Tokens within the Near Protocol Ecoystem. Discover statistics, holders, transaction volume and more."
        />
        <meta
          property="twitter:title"
          content="Near Protocol Ecosystem Tokens (NEP-141) | NearBlocks"
        />
        <meta
          property="twitter:description"
          content="A curated list of all NEP-141 Tokens within the Near Protocol Ecoystem. Discover statistics, holders, transaction volume and more."
        />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/tokens`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10">
              Near Protocol Ecosystem Tokens (NEP-141)
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-3 -mt-48 ">
          <div style={height} className="relative block lg:flex lg:space-x-2">
            <div className="w-full " suppressHydrationWarning={true}>
              <VmComponent
                src={components?.ftList}
                skeleton={<List className="absolute" ref={heightRef} />}
                defaultSkelton={<List />}
                onChangeHeight={onChangeHeight}
                props={{
                  t: t,
                  currentPage: currentPage,
                  setPage: setPage,
                  network: networkId,
                }}
                loading={<List className="absolute" ref={heightRef} />}
              />
            </div>
          </div>
        </div>
        <div className="py-8"></div>
      </section>
    </>
  );
};

TopFTTokens.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default TopFTTokens;
