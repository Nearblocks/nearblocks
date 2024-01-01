import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { useEffect, useState } from 'react';
import Router, { useRouter } from 'next/router';

import TableSkelton from '@/components/lib/Spinner/TableSkelton';

const TopFTTokens = () => {
  const router = useRouter();
  const components = useBosComponents();
  const { page } = router.query;
  const initialPage = page ? Number(page) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const setPage = (pageNumber: number) => {
    Router.push(`/tokens?page=${pageNumber}`);
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(page ? Number(page) : 1);
  }, [page]);
  const { t } = useTranslation();

  return (
    <section>
      <div className="bg-hero-pattern h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:text-2xl text-xl text-white">
            Near Protocol Ecosystem Tokens (NEP-141)
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-3 -mt-48 ">
        <div className="block lg:flex lg:space-x-2">
          <div className="w-full ">
            <div className=" bg-white border soft-shadow rounded-lg pb-1 ">
              <VmComponent
                src={components?.ftList}
                spinner={<TableSkelton />}
                props={{
                  t: t,
                  currentPage: currentPage,
                  setPage: setPage,
                  network: networkId,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </section>
  );
};

export default TopFTTokens;
