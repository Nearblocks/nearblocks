import Head from 'next/head';
import Layout from '@/components/Layouts';
import Index from '@/components/skeleton/node-explorer/Index';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId, appUrl } from '@/utils/config';
import Router, { useRouter } from 'next/router';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { env } from 'next-runtime-env';
import { useTheme } from 'next-themes';

const ogUrl = env('NEXT_PUBLIC_OG_URL');
const NodeExplorer = () => {
  const router = useRouter();
  const components = useBosComponents();
  const { page } = router.query;
  const initialPage = page ? Number(page) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  const { theme } = useTheme();

  const title = 'NEAR Validator List | Nearblocks';

  const setPage = (pageNumber: number) => {
    Router.push(`/node-explorer?page=${pageNumber}`, undefined, {
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
  const thumbnail = `${ogUrl}/thumbnail/basic?title=Near%20Protocol%20Validator%20Explorer&brand=near`;
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta property="og:title" content={title} />
        <meta property="twitter:title" content={title} />
        <meta property="og:image" content={thumbnail} />
        <meta property="twitter:image" content={thumbnail} />
        <link rel="canonical" href={`${appUrl}/node-explorer`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            NEAR Protocol Validator Explorer
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div style={height} className="relative">
          <VmComponent
            src={components?.nodeExplorer}
            skeleton={<Index className="absolute" ref={heightRef} />}
            defaultSkelton={<Index />}
            onChangeHeight={onChangeHeight}
            props={{
              currentPage: currentPage,
              setPage: setPage,
              network: networkId,
              theme: theme,
            }}
            loading={<Index className="absolute" ref={heightRef} />}
          />
        </div>
      </div>
    </>
  );
};

NodeExplorer.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default NodeExplorer;
