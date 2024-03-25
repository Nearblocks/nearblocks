import Layout from '@/components/Layouts';
import Index from '@/components/skeleton/node-explorer/Index';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import Router, { useRouter } from 'next/router';
import { ReactElement, useEffect, useRef, useState } from 'react';

const NodeExplorer = () => {
  const router = useRouter();
  const components = useBosComponents();
  const { page } = router.query;
  const initialPage = page ? Number(page) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
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
  return (
    <>
      <div className="bg-hero-pattern h-72">
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
            }}
          />
        </div>
      </div>
    </>
  );
};

NodeExplorer.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default NodeExplorer;
