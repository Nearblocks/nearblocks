import Index from '@/components/skeleton/node-explorer/Index';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import Router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const NodeExplorer = () => {
  const router = useRouter();
  const components = useBosComponents();
  const { page } = router.query;
  const initialPage = page ? Number(page) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const setPage = (pageNumber: number) => {
    Router.push(`/node-explorer?page=${pageNumber}`);
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(page ? Number(page) : 1);
  }, [page]);

  return (
    <div className="">
      <div className="bg-hero-pattern h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:sm:text-2xl text-xl text-white">
            NEAR Protocol Validator Explorer
          </h1>
        </div>
      </div>
      <VmComponent
        src={components?.nodeExplorer}
        skeleton={<Index />}
        props={{
          currentPage: currentPage,
          setPage: setPage,
          network: networkId,
        }}
      />
    </div>
  );
};

export default NodeExplorer;
