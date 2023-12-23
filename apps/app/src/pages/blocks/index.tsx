import Router, { useRouter } from 'next/router';

import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { useEffect, useState } from 'react';
import { networkId } from '@/utils/config';

const Blocks = () => {
  const router = useRouter();
  const components = useBosComponents();
  const { page } = router.query;

  const initialPage = page ? Number(page) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const setPage = (pageNumber: number) => {
    Router.push(`/blocks?page=${pageNumber}`);
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(page ? Number(page) : 1);
  }, [page]);

  return (
    <VmComponent
      src={components?.blocks}
      props={{
        currentPage: currentPage,
        setPage: setPage,
        network: networkId,
      }}
    />
  );
};

export default Blocks;
