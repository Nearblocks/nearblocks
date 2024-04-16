import Head from 'next/head';

import Layout from '@/components/Layouts';
import List from '@/components/skeleton/common/List';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId, appUrl } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Router, { useRouter } from 'next/router';
import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { env } from 'next-runtime-env';

const network = env('NEXT_PUBLIC_NETWORK_ID');

const TopNFTTokens = () => {
  const router = useRouter();
  const components = useBosComponents();
  const { page } = router.query;
  const { t } = useTranslation();
  const initialPage = page ? Number(page) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  const setPage = (pageNumber: number) => {
    Router.push(`/nft-tokens?page=${pageNumber}`, undefined, { shallow: true });
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
      <Head>
        <title>
          {`${
            network === 'testnet' ? 'TESTNET' : ''
          } Non-Fungible (NEP-171) Tokens (NFT) Token Tracker | NearBlocks`}
        </title>
        <meta
          name="title"
          content="Non-Fungible (NEP-171) Tokens (NFT) Token Tracker | NearBlocks"
        />
        <meta
          name="description"
          content="The list of Non-Fungible (NEP-171) Tokens (NFT) and their daily transfers in the Near Protocol on NearBlocks"
        />
        <meta
          property="og:title"
          content="Non-Fungible (NEP-171) Tokens (NFT) Token Tracker | NearBlocks"
        />
        <meta
          property="og:description"
          content="The list of Non-Fungible (NEP-171) Tokens (NFT) and their daily transfers in the Near Protocol on NearBlocks"
        />
        <meta
          property="twitter:title"
          content="Non-Fungible (NEP-171) Tokens (NFT) Token Tracker | NearBlocks"
        />
        <meta
          property="twitter:description"
          content="The list of Non-Fungible (NEP-171) Tokens (NFT) and their daily transfers in the Near Protocol on NearBlocks"
        />
        <meta
          property="og:image"
          content="/thumbnail/thumbnail_nft_tokens.png"
        />
        <meta
          property="twitter:image"
          content="/thumbnail/thumbnail_nft_tokens.png"
        />
        <link rel="canonical" href={`${appUrl}/nft-tokens`} />
      </Head>
      <section>
        <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white dark:text-neargray-10">
              Non-Fungible Token Tracker (NEP-171)
            </h1>
          </div>
        </div>
        <div className="container mx-auto px-3 -mt-48 ">
          <div style={height} className="relative block lg:flex lg:space-x-2">
            <div className="w-full ">
              <VmComponent
                src={components?.nftList}
                skeleton={<List className="absolute" ref={heightRef} />}
                defaultSkelton={<List />}
                onChangeHeight={onChangeHeight}
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
      </section>
    </>
  );
};

TopNFTTokens.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default TopNFTTokens;
