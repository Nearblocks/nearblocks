import { useEffect, useRef, useState } from 'react';
import {
  dollarFormat,
  dollarNonCentFormat,
  localFormat,
  priceFormat,
  serialNumber,
} from '@/utils/libs';
import { Sorting, Token } from '@/utils/types';
import Link from 'next/link';
import { fetcher } from '@/hooks/useFetch';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { Tooltip } from '@reach/tooltip';
import debounce from 'lodash/debounce';
import TokenImage from '@/components/common/TokenImage';
import ArrowUp from '@/components/Icons/ArrowUp';
import ArrowDown from '@/components/Icons/ArrowDown';
import Question from '@/components/Icons/Question';
import SortIcon from '@/components/Icons/SortIcon';
import Table from '@/components/common/Table';
import ErrorMessage from '@/components/common/ErrorMessage';
import FaInbox from '@/components/Icons/FaInbox';

const initialForm = {
  search: '',
};

const initialSorting: Sorting = {
  sort: 'onchain_market_cap',
  order: 'desc',
};

interface Props {
  data: {
    tokens: Token[];
    cursor: string;
  };
  tokensCount: {
    tokens: { count: number }[];
  };
  error: boolean;
}

const List = ({ data, tokensCount, error }: Props) => {
  const { t } = useTranslation('token');
  const router = useRouter();
  const { page, search }: any = router.query;
  const pagination = { page: page ? Number(page) : 1, per_page: 50 };
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [value, setValue] = useState<undefined | string>(undefined);
  const errorMessage = t ? t('token:fts.top.empty') : 'No tokens found!';
  const [isOpen, setIsOpen] = useState(false);
  const containerRef: any = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [sorting, setSorting] = useState<Sorting>(initialSorting);

  const tokens = data?.tokens;
  const totalCount = tokensCount?.tokens?.[0]?.count || 0;

  const debouncedSearch = useRef(
    debounce(async (keyword) => {
      fetcher(`fts?search=${keyword}&per_page=5`)
        .then((resp) => {
          setSearchResults(resp?.tokens);
        })
        .catch((error) => console.log(error));
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
    const { pathname, query } = router;
    const { page, ...updatedQuery } = query;
    router.push({ pathname, query: { ...updatedQuery, ...form, page: 1 } });
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
          router.push(`/token/${selectedToken.contract}`);
        }
      } else {
        if (value) {
          onFilter();
          setSelectedIndex(-1);
        } else if (Object.keys(router.query).length > 0) {
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

  const onOrder = (sortKey: string) => {
    setSorting((state) => {
      const {
        pathname,
        query: { order, ...updatedQuery },
      } = router;
      const newOrder: 'asc' | 'desc' =
        (order ?? 'desc') === 'asc' ? 'desc' : 'asc';
      const newState: Sorting = { ...state, sort: sortKey, order: newOrder };
      router.push({ pathname, query: { ...updatedQuery, order: newOrder } });
      return newState;
    });
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
      header: <span>{t ? t('token:fts.top.token') : 'TOKEN'}</span>,
      key: 'name',
      cell: (row: Token) => (
        <>
          <div className="flex items-center w-72">
            <TokenImage
              src={row?.icon}
              alt={row?.name}
              className="w-5 h-5 mr-2"
            />
            <Link
              href={`/token/${row?.contract}`}
              className=" text-green-500 dark:text-green-250 hover:no-underline flex items-center"
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
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-80 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span>{t ? t('token:fts.top.price') : 'PRICE'}</span>,
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
      thClassName:
        'px-6 py-2 w-48 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: (
        <span className=" whitespace-nowrap">
          {t ? t('token:fts.top.change') : 'CHANGE'} (%)
        </span>
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
      thClassName:
        'px-6 py-2 w-60 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span>{t ? t('token:fts.top.volume') : 'VOLUME'} (24H)</span>,
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
      thClassName:
        'px-6 py-2 w-52 text-left text-xs whitespace-nowrap font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: (
        <span className="flex">
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
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 tracking-wider',
    },
    {
      header: (
        <span>
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
                name="search"
                autoComplete="off"
                placeholder="Search"
                className="search ml-2 pl-8 token-search bg-white dark:bg-black-600 dark:border-black-200 w-full h-full text-sm py-2 outline-none border rounded-lg"
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onFocus={() => setIsOpen(true)}
              />
            </label>
            {isOpen && value && searchResults?.length > 0 && (
              <div className="z-50 relative">
                <div className="text-xs rounded-b-md -mr-2 ml-2 -mt-1 bg-white border-x border-b dark:border-black-200 dark:bg-black-600 py-2 shadow">
                  {searchResults.map((token, index) => (
                    <div
                      key={token?.contract}
                      className={`mx-2 px-2 py-2 text-nearblue-600 dark:text-neargray-10 cursor-pointer hover:border-gray-500 truncate ${
                        selectedIndex === index
                          ? 'bg-gray-100 dark:bg-black-200'
                          : 'hover:bg-gray-100 dark:hover:bg-black-200'
                      }`}
                    >
                      <Link
                        href={`/token/${token?.contract}`}
                        className="hover:no-underline flex items-center my-1 whitespace-nowrap "
                      >
                        <div className="flex-shrink-0 h-5 w-5 mr-2">
                          <TokenImage
                            src={token?.icon}
                            alt={token?.name}
                            className="w-5 h-5"
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
        data={tokens}
        isPagination={true}
        count={totalCount}
        page={pagination.page}
        limit={pagination.per_page}
        pageLimit={200}
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
};
export default List;
