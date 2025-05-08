'use client';
import debounce from 'lodash/debounce';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import QueryString from 'qs';
import { useEffect, useRef, useState } from 'react';

import { Link, usePathname } from '@/i18n/routing';
import {
  dollarFormat,
  dollarNonCentFormat,
  localFormat,
  serialNumber,
} from '@/utils/libs';
import { Sorting, StatusInfo, Token } from '@/utils/types';

import ErrorMessage from '../common/ErrorMessage';
import Table from '../common/Table';
import TokenImage from '../common/TokenImage';
import Tooltip from '../common/Tooltip';
import ArrowDown from '../Icons/ArrowDown';
import ArrowUp from '../Icons/ArrowUp';
import FaInbox from '../Icons/FaInbox';
import Question from '../Icons/Question';
import SortIcon from '../Icons/SortIcon';
import TokenPrice from './FT/TokenPrice';

const initialForm = {
  search: '',
};

interface Props {
  data: {
    cursor: string;
    tokens: Token[];
  };
  error: boolean;
  handleSearch: any;
  stats: StatusInfo;
  tokensCount: {
    tokens: { count: number }[];
  };
}

const List = ({ data, error, handleSearch, stats, tokensCount }: Props) => {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const order = searchParams?.get('order');
  const sort = searchParams?.get('sort');
  const initialSorting: Sorting = {
    order: order === 'asc' ? 'asc' : 'desc',
    sort: sort || 'onchain_market_cap',
  };
  const page = searchParams?.get('page');
  const search = searchParams?.get('search');
  const pagination = { page: page ? Number(page) : 1, per_page: 50 };
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [value, setValue] = useState<string | undefined>(undefined);
  const errorMessage = t ? t('fts.top.empty') : 'No tokens found!';
  const [isOpen, setIsOpen] = useState(false);
  const containerRef: any = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [sorting, setSorting] = useState<Sorting>(initialSorting);

  const tokens = data?.tokens?.filter((token) => token?.contract !== 'aurora');
  const totalCount = tokensCount?.tokens?.[0]?.count || 0;

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
          router.push(`/token/${selectedToken.contract}`);
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
          router.push(`/tokens`);
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

  useEffect(() => {
    if (!order && !sort) {
      setSorting(initialSorting);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, sort]);

  const onOrder = (sortKey: string) => {
    const {
      sort: currentSort = 'onchain_market_cap',
      order: currentOrder = 'desc',
    } = QueryString.parse(searchParams?.toString() || '');
    const newOrder =
      currentSort === sortKey && currentOrder === 'desc' ? 'asc' : 'desc';
    const newQueryString = QueryString.stringify({
      ...QueryString.parse(searchParams?.toString() || ''),
      sort: sortKey,
      order: newOrder,
    });
    setSorting((state) => ({
      ...state,
      order: newOrder,
      sort: sortKey,
    }));
    router.push(`${pathname}?${newQueryString}`);
  };

  const columns: any = [
    {
      cell: (_row: Token, i: number) => (
        <span>{serialNumber(i, pagination.page, pagination.per_page)}</span>
      ),
      header: <span>#</span>,
      key: '',
      tdClassName:
        'pl-6 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-middle',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: Token) => (
        <>
          <div className="flex items-center w-72">
            <TokenImage
              alt={row?.name}
              className="w-5 h-5 mr-2"
              src={row?.icon}
            />
            <Link
              className=" text-green-500 dark:text-green-250 hover:no-underline flex items-center font-medium"
              href={`/token/${row?.contract}`}
            >
              <span className="inline-block truncate max-w-[200px] mr-1">
                {row?.name}
              </span>
              <span className="text-nearblue-700 inline-block truncate max-w-[80px]">
                {row?.symbol}
              </span>
            </Link>
          </div>
        </>
      ),
      header: <span>{t ? t('fts.top.token') : 'TOKEN'}</span>,
      key: 'name',
      tdClassName:
        'px-6 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-80 align-middle',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: Token) => (
        <TokenPrice
          nearPrice={stats?.near_price}
          token={row?.contract}
          tokenPrice={row?.price}
        />
      ),
      header: (
        <span>
          <button
            className="w-full py-2 text-left text-xs font-semibold  tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex flex-row"
            onClick={() => onOrder('price')}
            type="button"
          >
            {sorting?.sort === 'price' && (
              <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
                <SortIcon order={sorting?.order} />
              </div>
            )}
            {t ? t('fts.top.price') : 'PRICE'}
          </button>
        </span>
      ),
      key: 'price',
      tdClassName:
        'px-6 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-middle',
      thClassName:
        'px-6 py-2 w-48 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
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
      header: (
        <span>
          <button
            className="w-full py-2 text-left text-xs font-semibold  tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex flex-row"
            onClick={() => onOrder('change')}
            type="button"
          >
            {sorting?.sort === 'change' && (
              <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
                <SortIcon order={sorting?.order} />
              </div>
            )}
            <span className="flex whitespace-nowrap">
              {t ? t('fts.top.change') : 'CHANGE'} (%)
            </span>
          </button>
        </span>
      ),
      key: 'change_24',
      tdClassName:
        'px-6 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-middle',
      thClassName:
        'px-6 py-2 w-60 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      cell: (row: Token) => (
        <span>
          {row?.volume_24h === null ? (
            <span className="text-xs">N/A</span>
          ) : (
            `$${dollarNonCentFormat(row?.volume_24h)}`
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
            {sorting?.sort === 'volume' && (
              <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
                <SortIcon order={sorting?.order} />
              </div>
            )}
            {t ? t('fts.top.volume') : 'VOLUME'} (24H)
          </button>
        </span>
      ),
      key: 'volume_24h',
      tdClassName:
        'px-6 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-middle',
      thClassName:
        'px-6 py-2 w-52 text-left text-xs whitespace-nowrap font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
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
      header: (
        <span>
          <button
            className="w-full py-2 text-left text-xs font-semibold  tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex flex-row"
            onClick={() => onOrder('market_cap')}
            type="button"
          >
            {sorting?.sort === 'market_cap' && (
              <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
                <SortIcon order={sorting?.order} />
              </div>
            )}
            <span className="uppercase whitespace-nowrap">Circulating MC</span>
            <Tooltip
              className={'w-96 -mr-28 right-1/2 max-w-[200px]'}
              position="bottom"
              tooltip={
                'Calculated by multiplying the number of tokens in circulating supply across all chains with the current market price per token.'
              }
            >
              <div>
                <Question className="w-4 h-4 fill-current ml-1" />
              </div>
            </Tooltip>
          </button>
        </span>
      ),
      key: 'market_cap',
      tdClassName:
        'px-6 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-middle',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 tracking-wider',
    },
    {
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
      header: (
        <span>
          <button
            className="w-full px-6 py-2 text-left text-xs font-semibold  tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex flex-row"
            onClick={() => onOrder('onchain_market_cap')}
            type="button"
          >
            {sorting?.sort === 'onchain_market_cap' && (
              <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
                <SortIcon order={sorting?.order} />
              </div>
            )}
            <span className="uppercase whitespace-nowrap">On-Chain MC</span>
            <Tooltip
              className={'w-96 -mr-28 right-1/2 max-w-[200px]'}
              position="bottom"
              tooltip={`Calculated by multiplying the token's  Total Supply on Near with the current market price per token`}
            >
              <div>
                <Question className="w-4 h-4 fill-current ml-1" />
              </div>
            </Tooltip>
          </button>
        </span>
      ),
      key: 'onchain_market_cap',
      tdClassName:
        'px-6 py-3 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-middle',
    },
  ];
  return (
    <div className=" bg-white  dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl pb-1 ">
      <div className="flex flex-row items-center justify-between text-left text-sm text-nearblue-600 dark:text-neargray-10 px-3 py-2">
        <p className="pl-3">
          {tokens?.length > 0 &&
            totalCount > 0 &&
            `${t('fts.top.listing', {
              count: localFormat(totalCount.toString()),
            })}`}
        </p>
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
                      key={token?.contract}
                    >
                      <Link
                        className="hover:no-underline flex items-center my-1 whitespace-nowrap "
                        href={`/token/${token?.contract}`}
                      >
                        <div className="flex-shrink-0 h-5 w-5 mr-2">
                          <TokenImage
                            alt={token?.name}
                            className="w-5 h-5"
                            src={token?.icon}
                          />
                        </div>
                        <p className="font-semibold text-nearblue-600 dark:text-neargray-10 text-sm truncate">
                          {token?.name}
                          <span className="text-nearblue-700 ml-2">
                            {token?.symbol}
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
      </div>
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
      />
    </div>
  );
};
export default List;
