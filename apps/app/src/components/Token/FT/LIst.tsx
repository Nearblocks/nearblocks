import { useEffect, useRef, useState } from 'react';
import {
  dollarFormat,
  dollarNonCentFormat,
  localFormat,
  priceFormat,
  serialNumber,
} from '@/utils/libs';
import { Token } from '@/utils/types';
import Link from 'next/link';
import { fetcher, useFetch } from '@/hooks/useFetch';
import useSorting from '@/hooks/useSorting';
import useQSFilters from '@/hooks/useQSFilters';
import usePagination from '@/hooks/usePagination';
import { useRouter } from 'next/router';
import { getConfig, networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import { Tooltip } from '@reach/tooltip';
import debounce from 'lodash/debounce';
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from '@reach/combobox';
import SortIcon from '@/components/Icons/SortIcon';
import TokenImage from '@/components/common/TokenImage';
import ArrowUp from '@/components/Icons/ArrowUp';
import ArrowDown from '@/components/Icons/ArrowDown';
import Question from '@/components/Icons/Question';
import Skeleton from '@/components/skeleton/common/Skeleton';
import Table from '@/components/common/Table';
import ErrorMessage from '@/components/common/ErrorMessage';
import FaInbox from '@/components/Icons/FaInbox';

const initialForm = {
  search: '',
};
const initialSorting = {
  sort: 'onchain_market_cap',
};
export default function () {
  const { t } = useTranslation('token');
  const router = useRouter();
  const { pages } = router.query;
  const initialPagination = {
    page: pages ? Number(pages) : 1,
    per_page: 50,
  };
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const errorMessage = t ? t('token:fts.top.empty') : 'No tokens found!';
  const { qs, setFilters } = useQSFilters();
  const [form, setForm] = useState(initialForm);
  const { sqs, sorting, setSorting, resetSorting } = useSorting(initialSorting);
  const { pqs, pagination, setPagination, resetPagination } =
    usePagination(initialPagination);
  const config = getConfig && getConfig(networkId);

  const { data, loading, error } = useFetch(`fts?${qs}&${sqs}&${pqs}`);
  const { data: countData, loading: countLoading } = useFetch(
    `fts/count?${getSearchValue(qs)}`,
  );

  function getSearchValue(inputString: string) {
    const parts = inputString.split('&');
    for (const part of parts) {
      const [key, _value] = part.split('=');
      if (key === 'search') {
        return part;
      }
    }
    return '';
  }

  const tokens = data?.tokens || [];
  const totalCount = countData?.tokens?.[0]?.count || 0;
  const debouncedSearch = useRef(
    debounce(async (keyword) => {
      const resp = await fetcher(`fts?search=${keyword}&per_page=5`);

      setSearchResults(resp?.tokens);
    }, 500),
  ).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    debouncedSearch(value);
    setForm((f) => ({ ...f, [name]: value }));
  };
  const onFilter = (e: any) => {
    e.preventDefault();
    resetSorting();
    resetPagination();
    setFilters((state) => ({ ...state, ...form, pages: 1 }));
  };
  const onOrder = (sortKey: string) => {
    setSorting((state) => ({
      ...state,
      sort: sortKey,
      order:
        state.sort === sortKey
          ? state.order === 'asc'
            ? 'desc'
            : 'asc'
          : 'desc',
    }));
  };
  const setPage = (page: any) => {
    if (typeof page === 'function') {
      setFilters((state) => ({ ...state, pages: page }));
      return setPagination((state) => ({ ...state, page: page(state.page) }));
    }
    setFilters((state) => ({ ...state, pages: page }));
    return setPagination('page', page);
  };

  useEffect(() => {
    setPagination((state) => ({ ...state, page: pages ? Number(pages) : 1 }));
  }, [pages]);

  const onSort = (sort: string) => {
    resetPagination();
    setSorting((state) => ({
      ...state,
      sort,
      order:
        state.sort === sort ? (state.order === 'asc' ? 'desc' : 'asc') : 'desc',
    }));
  };

  const columns: any = [
    {
      header: <span>#</span>,
      key: '',
      cell: (_row: Token, i: number) => (
        <span>{serialNumber(i, pagination.page, pagination.per_page)}</span>
      ),
      tdClassName:
        'pl-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: (
        <button
          type="button"
          onClick={() => onSort('name')}
          className="w-full px-6 py-2 text-left text-xs font-semibold  tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex flex-row"
        >
          {sorting?.sort === 'name' && (
            <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
              <SortIcon order={sorting?.order} />
            </div>
          )}
          <span className="uppercase whitespace-nowrap">
            {' '}
            {t('fts.top.token')}
          </span>
        </button>
      ),
      key: 'name',
      cell: (row: Token) => (
        <>
          <div className="flex items-center">
            <TokenImage
              src={row?.icon}
              alt={row?.name}
              appUrl={config?.appUrl}
              className="w-5 h-5 mr-2"
            />
            <Link
              href={`/token/${row?.contract}`}
              className="hover:no-underline"
              legacyBehavior
            >
              <a className=" text-green-500 dark:text-green-250 hover:no-underline flex items-center">
                <span className="inline-block truncate max-w-[200px] mr-1">
                  {row?.name}
                </span>
                <span className="text-nearblue-700 inline-block truncate max-w-[80px]">
                  {row?.symbol}
                </span>
              </a>
            </Link>
          </div>
        </>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-80  align-top',
      thClassName:
        'text-left text-xs font-semibold text-gray-500 uppercase tracking-wider',
    },
    {
      header: (
        <button
          type="button"
          onClick={() => onSort('price')}
          className="w-full px-6 py-2 text-left text-xs font-semibold  tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex flex-row"
        >
          {sorting?.sort === 'price' && (
            <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
              <SortIcon order={sorting?.order} />
            </div>
          )}
          <span className="uppercase whitespace-nowrap">
            {' '}
            {t('fts.top.price')}
          </span>
        </button>
      ),
      key: 'price',
      cell: (row: Token) => (
        <span>
          {row?.price === null ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${priceFormat(row?.price)}`
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
    },
    {
      header: (
        <button
          type="button"
          onClick={() => onSort('change')}
          className="w-full px-6 py-2 text-left text-xs font-semibold  tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex flex-row"
        >
          {sorting?.sort === 'change' && (
            <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
              <SortIcon order={sorting?.order} />
            </div>
          )}
          <span className="uppercase whitespace-nowrap">
            {t('fts.top.change')}(%)
          </span>
        </button>
      ),
      key: 'change_24',
      cell: (row: Token) => (
        <span>
          {row?.change_24 === null ? (
            <span className="text-xs">N/A</span>
          ) : Number(row?.change_24) > 0 ? (
            <div className="text-neargreen flex flex-row items-center">
              <ArrowUp className="h-3 w-3 fill-current mr-1" />+
              {dollarFormat(row?.change_24)}%
            </div>
          ) : (
            <div className="text-red-500 flex flex-row items-center">
              <ArrowDown className="h-3 w-3 fill-current mr-1" />
              {row?.change_24 ? dollarFormat(row?.change_24) + '%' : ''}
            </div>
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
    },
    {
      header: (
        <button
          type="button"
          onClick={() => onSort('volume')}
          className="w-full px-6 py-2 text-left text-xs font-semibold  tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex flex-row"
        >
          {sorting?.sort === 'volume' && (
            <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
              <SortIcon order={sorting?.order} />
            </div>
          )}
          <span className="uppercase whitespace-nowrap">
            {t('fts.top.volume')} (24H)
          </span>
        </button>
      ),
      key: 'volume_24h',
      cell: (row: Token) => (
        <span>
          {row?.volume_24h === null ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${dollarNonCentFormat(row?.volume_24h)}`
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
    },
    {
      header: (
        <span>
          {' '}
          <button
            type="button"
            onClick={() => onSort('market_cap')}
            className="w-full px-6 py-2 text-left text-xs font-semibold  tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex flex-row"
          >
            {sorting?.sort === 'market_cap' && (
              <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
                <SortIcon order={sorting?.order} />
              </div>
            )}
            <span className="uppercase whitespace-nowrap">Circulating MC</span>
            <Tooltip
              label={
                'Calculated by multiplying the number of tokens in circulating supply across all chains with the current market price per token.'
              }
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
            >
              <div>
                <Question className="w-4 h-4 fill-current ml-1" />
              </div>
            </Tooltip>
          </button>
        </span>
      ),
      key: 'market_cap',
      cell: (row: Token) => (
        <span>
          {row?.market_cap === null ||
          dollarNonCentFormat(row?.market_cap) === '0' ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${dollarNonCentFormat(row?.market_cap)}`
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
    },
    {
      header: (
        <span>
          {' '}
          <button
            type="button"
            onClick={() => onOrder('onchain_market_cap')}
            className="w-full px-6 py-2 text-left text-xs font-semibold  tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex flex-row"
          >
            {sorting?.sort === 'onchain_market_cap' && (
              <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
                <SortIcon order={sorting?.order} />
              </div>
            )}
            <span className="uppercase whitespace-nowrap">On-Chain MC</span>
            <Tooltip
              label={`Calculated by multiplying the token's  Total Supply on Near with the current market price per token`}
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
            >
              <div>
                <Question className="w-4 h-4 fill-current ml-1" />
              </div>
            </Tooltip>
          </button>
        </span>
      ),
      key: 'onchain_market_cap',
      cell: (row: Token) => (
        <span>
          {row?.onchain_market_cap === null ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${
              row?.onchain_market_cap
                ? dollarNonCentFormat(row?.onchain_market_cap)
                : row?.onchain_market_cap ?? ''
            }`
          )}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
    },
  ];

  return (
    <div className=" bg-white  dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl pb-1 ">
      <div className="flex flex-row items-center justify-between text-left text-sm text-nearblue-600 dark:text-neargray-10 px-3 py-2">
        {countLoading ? (
          <div className="max-w-lg w-full pl-3">
            <Skeleton className="leading-7 pl-6 max-w-sm py-4 h-[60px]" />
          </div>
        ) : (
          <p className="pl-3">
            {`${t('fts.top.listing', {
              count: localFormat(totalCount),
            })}`}
          </p>
        )}
        <form onSubmit={onFilter} className={`flex w-full h-10 sm:w-80 mr-2`}>
          <Combobox className="flex-grow">
            <label htmlFor="token-search" id="token-search">
              <ComboboxInput
                name="search"
                autoComplete="off"
                placeholder="Search"
                className="search ml-2 pl-8 token-search bg-white dark:bg-black-600 dark:border-black-200 w-full h-full text-sm py-2 outline-none border rounded-lg"
                onChange={onChange}
              />
            </label>
            {searchResults?.length > 0 && (
              <ComboboxPopover className="z-50">
                <ComboboxList className="text-xs rounded-b-md -mt-1 bg-white dark:bg-black-600 dark:border-black-200 border py-2 shadow">
                  {searchResults.map((token) => (
                    <ComboboxOption
                      value={token.name || token.contract}
                      key={token?.contract}
                      className="mx-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:hover:border-black-600 cursor-pointer hover:border-gray-500 truncate"
                    >
                      <Link href={`/token/${token?.contract}`} legacyBehavior>
                        <a className="hover:no-underline flex items-center my-1 whitespace-nowrap ">
                          <div className="flex-shrink-0 h-5 w-5 mr-2">
                            <TokenImage
                              src={token?.icon}
                              alt={token?.name}
                              appUrl={config?.appUrl}
                              className="w-5 h-5"
                            />
                          </div>
                          <p className="font-semibold text-nearblue-600 dark:text-neargray-10 text-sm truncate">
                            {token?.name}
                            <span className="text-nearblue-700 ml-2">
                              {token?.symbol}
                            </span>
                          </p>
                        </a>
                      </Link>
                    </ComboboxOption>
                  ))}
                </ComboboxList>
              </ComboboxPopover>
            )}
          </Combobox>
        </form>
      </div>
      <Table
        columns={columns}
        data={tokens}
        isLoading={loading}
        countLoading={countLoading}
        isPagination={true}
        count={totalCount}
        page={pagination.page}
        limit={pagination.per_page}
        pageLimit={200}
        setPage={setPage}
        Error={error}
        ErrorText={
          <ErrorMessage
            icons={<FaInbox />}
            message={errorMessage || ''}
            mutedText="Please try again later"
          />
        }
      />
    </div>
  );
}
