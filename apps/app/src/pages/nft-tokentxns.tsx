import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { ReactElement, useEffect, useRef, useState } from 'react';
import Router, { useRouter } from 'next/router';
import List from '@/components/skeleton/common/List';
import Layout from '@/components/Layouts';

const NftToxenTxns = () => {
  const router = useRouter();
  const components = useBosComponents();
  const { page } = router.query;
  const { t } = useTranslation();
  const initialPage = page ? Number(page) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  const setPage = (pageNumber: number) => {
    Router.push(`/nft-tokentxns?page=${pageNumber}`);
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
    <section>
      <div className="bg-hero-pattern h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:text-2xl text-xl text-white">
            {t ? t('token:nfts.heading') : 'Non-Fungible Token Transfers'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-3 -mt-48 ">
        <div style={height} className="relative block lg:flex lg:space-x-2">
          <div className="w-full ">
            <VmComponent
              src={components?.nftTransfersList}
              skeleton={<List className="absolute" ref={heightRef} />}
              defaultSkelton={<List />}
              onChangeHeight={onChangeHeight}
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
      <div className="py-8"></div>
    </section>
  );
};
NftToxenTxns.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;
export default NftToxenTxns;
