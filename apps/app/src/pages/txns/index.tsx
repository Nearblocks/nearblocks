import Router from 'next/router';

import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { useEffect, useState } from 'react';
import { networkId } from '@/utils/config';

const TransactionList = () => {
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
    <VmComponent
      src={components?.transactionsList}
      props={{
        currentPage: currentPage,
        setPage: setPage,
        filters: filtersObject,
        handleFilter: handleFilter,
        onFilterClear: onFilterClear,
        network: networkId,
      }}
    />
  );
};

export default TransactionList;
