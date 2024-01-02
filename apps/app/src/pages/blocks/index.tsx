import Router, { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { useEffect, useState } from 'react';
import { networkId } from '@/utils/config';
import List from '@/components/skeleton/common/List';

const Blocks = () => {
  const { t } = useTranslation();
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
    <>
      <div className="bg-hero-pattern h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:sm:text-2xl text-xl text-white">
            {t ? t('blocks:heading') : 'Latest Near Protocol Blocks'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className="block lg:flex lg:space-x-2">
          <div className="w-full ">
            <div className="bg-white border soft-shadow rounded-lg overflow-hidden">
              <VmComponent
                skeleton={<List />}
                src={components?.blocks}
                props={{
                  currentPage: currentPage,
                  setPage: setPage,
                  network: networkId,
                  t: t,
                }}
              />{' '}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blocks;
