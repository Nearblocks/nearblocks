import Head from 'next/head';
import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { networkId, appUrl } from '@/utils/config';
import List from '@/components/skeleton/common/List';
import Layout from '@/components/Layouts';
import { env } from 'next-runtime-env';

const network = env('NEXT_PUBLIC_NETWORK_ID');

const TransactionList = () => {
  const { t } = useTranslation();
  const components = useBosComponents();
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const heightRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState({});
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const filtersFromURL: { [key: string]: string } = {};

    for (const [key, value] of queryParams.entries()) {
      if (key !== 'page') {
        filtersFromURL[key] = value;
      }
    }

    if (Object.keys(filtersFromURL).length > 0) {
      setFilters(filtersFromURL);
    }

    const pageParam = queryParams.get('page');
    const initialPage = pageParam ? Number(pageParam) : 1;
    setCurrentPage(initialPage);
  }, [setCurrentPage]);

  const updateURL = (params: { [key: string]: string | number }) => {
    const queryString = Object.keys(params)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(
            params[key].toString(),
          )}`,
      )
      .join('&');

    const url = `/txns${queryString ? `?${queryString}` : ''}`;
    Router.push(url, undefined, { shallow: true });
  };

  const setPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    updateURL({ ...filters, page: pageNumber });
  };

  const handleFilter = (name: string, value: string) => {
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    updateURL({ ...updatedFilters, page: 1 });
    setCurrentPage(1);
  };

  const onFilterClear = (name: string) => {
    let updatedFilters = { ...filters };
    if (updatedFilters.hasOwnProperty(name)) {
      delete updatedFilters[name];
      setFilters(updatedFilters);

      updateURL({ ...updatedFilters, page: 1 });
      setCurrentPage(1);
    } else {
      updatedFilters = {};
      setFilters(updatedFilters);
      updateURL({ ...updatedFilters, page: 1 });
      setCurrentPage(1);
    }
  };

  const filtersObject = filters ? filters : {};
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
          {`${network === 'testnet' ? 'TESTNET' : ''} ${t('txns:metaTitle')} `}
        </title>
        <meta name="title" content={t('txns:metaTitle')} />
        <meta name="description" content={t('txns:metaDescription')} />
        <meta property="og:title" content={t('txns:metaTitle')} />
        <meta property="og:description" content={t('txns:metaDescription')} />
        <meta property="twitter:title" content={t('txns:metaTitle')} />
        <meta
          property="twitter:description"
          content={t('txns:metaDescription')}
        />
        <link rel="canonical" href={`${appUrl}/txns`} />
      </Head>
      <div className="bg-hero-pattern dark:bg-hero-pattern-dark h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:!text-2xl text-xl text-white">
            {t ? t('txns:heading') : 'Latest Near Protocol transactions'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div style={height} className="relative block lg:flex lg:space-x-2">
          <div className=" w-full">
            <VmComponent
              src={components?.transactionsList}
              skeleton={<List className="absolute" ref={heightRef} />}
              defaultSkelton={<List />}
              onChangeHeight={onChangeHeight}
              props={{
                currentPage: currentPage,
                t: t,
                setPage: setPage,
                filters: filtersObject,
                handleFilter: handleFilter,
                onFilterClear: onFilterClear,
                network: networkId,
              }}
              loading={<List className="absolute" ref={heightRef} />}
            />{' '}
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
};

TransactionList.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export default TransactionList;
