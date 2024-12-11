'use client';

import { debounce } from 'lodash';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import { Suspense, useEffect, useRef, useState } from 'react';

import { Link, usePathname } from '@/i18n/routing';
import {
  dollarNonCentFormat,
  localFormat,
  priceFormat,
  serialNumber,
} from '@/utils/libs';
import { DexInfo, Sorting } from '@/utils/types';

import ErrorMessage from '../common/ErrorMessage';
import Table from '../common/Table';
import TokenImage from '../common/TokenImage';
import FaInbox from '../Icons/FaInbox';
import SortIcon from '../Icons/SortIcon';
import Skeleton from '../skeleton/common/Skeleton';

interface Props {
  data: {
    pairs: DexInfo[];
  };
  dataCount: {
    pairs: { count: number }[];
  };
  error: boolean;
  handleSearch: any;
}

const initialSorting: Sorting = {
  order: 'desc',
  sort: '-',
};

const initialForm = {
  search: '',
};

const ListActions = ({ data, dataCount, error, handleSearch }: Props) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams?.get('page');
  const search = searchParams?.get('search');
  const pagination = { page: page ? Number(page) : 1, per_page: 50 };
  const [searchResults, setSearchResults] = useState<DexInfo[]>([]);
  const [value, setValue] = useState<string | undefined>(undefined);
  const containerRef: any = useRef(null);
  const errorMessage = t ? t('fts.top.empty') : 'No tokens found!';
  const tokens = data?.pairs;
  const totalCount = dataCount?.pairs?.[0]?.count || 0;
  const [address, setAddress] = useState('');
  const [sorting, setSorting] = useState<Sorting>(initialSorting);
  const [form, setForm] = useState(initialForm);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const onHandleMouseOver = (e: any, id: string) => {
    e.preventDefault();
    setAddress(id);
  };
  const handleMouseLeave = () => {
    setAddress('');
  };

  const debouncedSearch = useRef(
    debounce(async (keyword) => {
      setSearchResults(await handleSearch(keyword));
    }, 500),
  ).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      event.target &&
      !containerRef.current.contains(event.target)
    ) {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    if (!value || value.trim() === '') {
      setSearchResults([]);
      setValue(undefined);
      return;
    }
    debouncedSearch(value);
    setForm((f) => ({ ...f, [name]: value }));
    setValue(value);
  };

  const onFilter = () => {
    const currentParams = QueryString.parse(searchParams?.toString() || '');
    const { locale, page, ...updatedQuery } = currentParams;
    const updatedParams = { ...updatedQuery, ...form, page: 1 };
    const newQueryString = QueryString.stringify(updatedParams);

    // @ts-ignore: Unreachable code error
    router.push(`${pathname}?${newQueryString}`);
  };

  useEffect(() => {
    if (search) {
      setValue(search);
      setForm((f) => ({ ...f, ['search']: search }));
      debouncedSearch(search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (selectedIndex > -1) {
        const selectedToken = searchResults[selectedIndex];
        if (selectedToken) {
          // @ts-ignore: Unreachable code error
          router.push(`/dex/${selectedToken.id}`);
        }
      } else {
        if (value) {
          onFilter();
          setSelectedIndex(-1);
        } else if (
          Object.keys(QueryString.parse(searchParams?.toString() || ''))
            .length > 0
        ) {
          // @ts-ignore: Unreachable code error
          router.push(`/dex`);
        }
      }
    }
    if (searchResults?.length) {
      if (e.key === 'ArrowDown') {
        setSelectedIndex((prevIndex) => {
          const nextIndex =
            prevIndex < searchResults.length - 1 ? prevIndex + 1 : -1;
          return nextIndex;
        });
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex((prevIndex) => {
          const prevIndexVal = prevIndex > 0 ? prevIndex - 1 : -1;
          return prevIndexVal;
        });
      }
    } else {
      setSelectedIndex(-1);
    }
  };

  const onOrder = (sortKey: string) => {
    const currentOrder = searchParams?.get('order') || 'desc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    const currentParams = QueryString.parse(searchParams?.toString() || '');
    const newParams = { ...currentParams, order: newOrder, sort: sortKey };
    const newQueryString = QueryString.stringify(newParams);
    setSorting((state) => {
      const newState: Sorting = { ...state, order: newOrder, sort: sortKey };
      return newState;
    });
    router.push(`${pathname}?${newQueryString}`);
  };

  const columns: any = [
    {
      cell: (_row: DexInfo, i: number) => (
        <span>{serialNumber(i, pagination.page, pagination.per_page)}</span>
      ),
      header: <span>#</span>,
      key: '',
      tdClassName:
        'pl-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top w-20',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: DexInfo) => (
        <>
          <div className="flex items-center">
            <Link
              className={`flex text-green-500 dark:text-green-250 hover:no-underline p-1 border rounded-md ${
                row?.base_meta?.name === address
                  ? 'bg-[#FFC10740] border-[#FFC10740] dark:bg-black-200 dark:border-neargray-50 border-dashed cursor-pointer text-[#033F40]'
                  : 'text-green-500 dark:text-green-250 border-transparent'
              }`}
              href={`/dex/${row?.base}`}
              onMouseLeave={handleMouseLeave}
              onMouseOver={(e) => onHandleMouseOver(e, row?.base_meta?.name)}
            >
              <TokenImage
                alt={row?.base_meta?.name}
                className="w-5 h-5 mr-2"
                src={row?.base_meta?.icon}
              />
              <span className="inline-block truncate max-w-[200px] mr-1">
                {row?.base_meta?.name}
              </span>
              <span className="text-nearblue-700 inline-block truncate max-w-[80px]">
                {row?.base_meta?.symbol}
              </span>
            </Link>
          </div>
        </>
      ),
      header: <span>{t ? t('fts.top.token') : 'TOKEN'}</span>,
      key: 'name',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-80 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: DexInfo) => (
        <span>
          {row?.price_token === null ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${priceFormat(row?.price_token)}`
          )}
        </span>
      ),
      header: <span>TOKEN PRICE</span>,
      key: 'price_token',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
      thClassName:
        'px-6 py-2 w-52 text-left text-xs whitespace-nowrap font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: DexInfo) => (
        <span>
          {row?.price_usd === null ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${priceFormat(row?.price_usd)}`
          )}
        </span>
      ),
      header: <span>AMOUNT</span>,
      key: 'price_usd',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
      thClassName:
        'px-6 py-2 w-48 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: DexInfo) => (
        <span>
          {row?.volume === null || dollarNonCentFormat(row?.volume) === '0' ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${dollarNonCentFormat(row?.volume)}`
          )}
        </span>
      ),
      header: (
        <span>
          <button
            className="w-full py-2 text-left text-xs font-semibold  tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex flex-row"
            onClick={() => onOrder('volume')}
            type="button"
          >
            <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
              <SortIcon order={sorting?.order} />
            </div>
            <span className="uppercase whitespace-nowrap">Volume</span>
          </button>
        </span>
      ),
      key: 'volume',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
    },
    {
      cell: (row: DexInfo) => (
        <span>
          {row?.txns === null || dollarNonCentFormat(row?.txns) === '0' ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${dollarNonCentFormat(row?.txns)}`
          )}
        </span>
      ),
      header: (
        <span>
          <button
            className="w-full py-2 text-left text-xs font-semibold  tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex flex-row"
            onClick={() => onOrder('txns')}
            type="button"
          >
            <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
              <SortIcon order={sorting?.order} />
            </div>
            <span className="uppercase whitespace-nowrap">Txns</span>
          </button>
        </span>
      ),
      key: 'txns',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
    },
    {
      cell: (row: DexInfo) => (
        <span>
          {row?.makers === null || dollarNonCentFormat(row?.makers) === '0' ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${dollarNonCentFormat(row?.makers)}`
          )}
        </span>
      ),
      header: (
        <span>
          <button
            className="w-full py-2 text-left text-xs font-semibold tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex flex-row"
            onClick={() => onOrder('makers')}
            type="button"
          >
            <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
              <SortIcon order={sorting?.order} />
            </div>
            <span className="uppercase whitespace-nowrap">Makers</span>
          </button>
        </span>
      ),
      key: 'makers',
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
    },
  ];
  return (
    <div className=" bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl pb-1 ">
      <Suspense
        fallback={
          <div className="pl-6 max-w-lg w-full py-5 ">
            <Skeleton className="pl-6 max-w-sm leading-7 h-4" />
          </div>
        }
      >
        <div className="flex flex-row items-center justify-between text-left text-sm text-nearblue-600 dark:text-neargray-10 pr-3">
          <div className="leading-7 pl-6 text-sm py-4 text-nearblue-600 dark:text-neargray-10">
            <p className="sm:w-full w-65">
              {data && (
                <span>
                  {tokens?.length > 0 &&
                    totalCount > 0 &&
                    `A total of ${localFormat(
                      totalCount.toString(),
                    )} trading pairs found`}
                </span>
              )}
            </p>
          </div>
          {data && (
            <div className="flex w-full h-10 sm:w-80 mr-2" ref={containerRef}>
              <div className="flex-grow">
                <label htmlFor="token-search" id="token-search">
                  <input
                    autoComplete="off"
                    className="search ml-2 pl-8 token-search bg-white dark:bg-black-600 dark:border-black-200 w-full h-full text-sm py-2 outline-none border rounded-lg"
                    name="search"
                    onChange={onChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={onKeyDown}
                    placeholder="Search"
                    value={value}
                  />
                </label>
                {isOpen && value && searchResults?.length > 0 && (
                  <div className="z-50 relative">
                    <div className="text-xs rounded-b-md -mr-2 ml-2 -mt-1 bg-white border-x border-b dark:border-black-200 dark:bg-black-600 py-2 shadow">
                      {searchResults.map((token, index) => (
                        <div
                          className={`mx-2 px-2 py-2 text-nearblue-600 dark:text-neargray-10 cursor-pointer hover:border-gray-500 truncate ${
                            selectedIndex === index
                              ? 'bg-gray-100 dark:bg-black-200'
                              : 'hover:bg-gray-100 dark:hover:bg-black-200'
                          }`}
                          key={token?.id}
                        >
                          <Link
                            className="hover:no-underline flex items-center my-1 whitespace-nowrap "
                            href={`/dex/${token?.id}`}
                          >
                            <div className="flex-shrink-0 h-5 w-5 mr-2">
                              <TokenImage
                                alt={token?.base_meta?.name}
                                className="w-5 h-5"
                                src={token?.base_meta?.icon}
                              />
                            </div>
                            <p className="font-semibold text-nearblue-600 dark:text-neargray-10 text-sm truncate">
                              {token?.base_meta?.name}
                              <span className="text-nearblue-700 ml-2">
                                {token?.base_meta?.symbol}
                              </span>
                            </p>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Suspense>
      <Table
        columns={columns}
        count={totalCount}
        data={tokens}
        Error={error}
        ErrorText={
          <ErrorMessage
            icons={<FaInbox />}
            message={errorMessage || ''}
            mutedText="Please try again later"
          />
        }
        isPagination={true}
        limit={pagination.per_page}
        page={pagination.page}
        pageLimit={200}
        rowLink={`/dex/`}
      />
    </div>
  );
};
export default ListActions;
