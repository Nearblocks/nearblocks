import Router from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { useEffect, useState } from 'react';
import { networkId } from '@/utils/config';
import List from '@/components/skeleton/common/List';

const TransactionList = () => {
  const { t } = useTranslation();
  const components = useBosComponents();
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState<number>(1);

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
    Router.push(url);
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

  return (
    <>
      <div className="bg-hero-pattern h-72">
        <div className="container mx-auto px-3">
          <h1 className="mb-4 pt-8 sm:sm:text-2xl text-xl text-white">
            {t ? t('txns:heading') : 'Latest Near Protocol transactions'}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-3 -mt-48">
        <div className=" relative block lg:flex lg:space-x-2">
          <div className=" w-full">
            <VmComponent
              skeleton={<List />}
              src={components?.transactionsList}
              props={{
                currentPage: currentPage,
                t: t,
                setPage: setPage,
                filters: filtersObject,
                handleFilter: handleFilter,
                onFilterClear: onFilterClear,
                network: networkId,
              }}
            />{' '}
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionList;
