import Layout from '@/components/Layouts';
import List from '@/components/skeleton/common/List';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Router, { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useState } from 'react';

const TopNFTTokens = () => {
  const router = useRouter();
  const components = useBosComponents();
  const { page } = router.query;
  const { t } = useTranslation();
  const initialPage = page ? Number(page) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const setPage = (pageNumber: number) => {
    Router.push(`/nft-tokens?page=${pageNumber}`);
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(page ? Number(page) : 1);
  }, [page]);

  return (
    <>
      <section>
        <div className="bg-hero-pattern h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:text-2xl text-xl text-white">
              Non-Fungible Token Tracker (NEP-171)
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-3 -mt-48 ">
          <div className="relative block lg:flex lg:space-x-2">
            <div className="w-full ">
              <VmComponent
                src={components?.nftList}
                skeleton={<List />}
                props={{
                  currentPage: currentPage,
                  setPage: setPage,
                  network: networkId,
                  t: t,
                }}
              />
            </div>
          </div>
        </div>
        <div className="py-8"></div>
      </section>
    </>
  );
};

TopNFTTokens.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default TopNFTTokens;
