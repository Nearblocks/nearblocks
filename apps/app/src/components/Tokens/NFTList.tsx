import { Sorting, Token } from '@/utils/types';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { fetcher } from '@/hooks/useFetch';
import { localFormat, serialNumber } from '@/utils/libs';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { debounce } from 'lodash';
import TokenImage from '@/components/common/TokenImage';
import SortIcon from '@/components/Icons/SortIcon';
import Table from '@/components/common/Table';
import ErrorMessage from '@/components/common/ErrorMessage';
import FaInbox from '@/components/Icons/FaInbox';
const initialSorting: Sorting = {
  sort: 'txns_day',
  order: 'desc',
};
const initialForm = {
  search: '',
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
  const { t } = useTranslation();
  const router = useRouter();
  const { page, search }: any = router.query;
  const pagination = { page: page ? Number(page) : 1, per_page: 50 };
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [value, setValue] = useState<undefined | string>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef: any = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [sorting, setSorting] = useState<Sorting>(initialSorting);
  const errorMessage = t ? t('token:fts.top.empty') : 'No tokens found!';

  const tokens = data?.tokens;
  const count = tokensCount?.tokens[0]?.count || 0;

  const debouncedSearch = useRef(
    debounce(async (keyword) => {
      fetcher(`nfts?search=${keyword}&per_page=5`)
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
          router.push(`/nft-token/${selectedToken.contract}`);
        }
      } else {
        if (value) {
          onFilter();
          setSelectedIndex(-1);
        } else if (Object.keys(router.query).length > 0) {
          router.push(`/nft-tokens`);
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
      cell: (_row: Token, index: number) => (
        <span>{serialNumber(index, pagination.page, pagination.per_page)}</span>
      ),
      tdClassName:
        'pl-6 py-4 whitespace-nowrap text-sm text-nearblue-700 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-[1px]',
    },
    {
      header: <span>Token</span>,
      key: 'name',
      cell: (row: Token) => (
        <>
          <div className="flex items-center">
            <TokenImage
              src={row?.icon}
              alt={row?.name}
              className="w-5 h-5 mr-2"
            />
            <Link
              href={`/nft-token/${row?.contract}`}
              className="flex text-green-500 dark:text-green-250 hover:no-underline"
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
        'px-6 py-4 whitespace-nowrap text-sm  text-nearblue-600 dark:text-neargray-10 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span>Tokens</span>,
      key: 'tokens',
      cell: (row: Token) => (
        <span>
          {row?.tokens ? localFormat(row?.tokens) : row?.tokens ?? ''}
        </span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-[160px]',
    },
    {
      header: <span>Holders</span>,
      key: 'holders',
      cell: (row: Token) => (
        <span>{row?.holders ? localFormat(row?.holders) : ''}</span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
      thClassName:
        'px-6 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-[160px]',
    },
    {
      header: (
        <span>
          <button
            type="button"
            onClick={() => onOrder('txns_day')}
            className="w-full px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-green-500 dark:text-green-250 focus:outline-none flex flex-row whitespace-nowrap"
          >
            {sorting.sort === 'txns_day' && (
              <div className="text-nearblue-600 dark:text-neargray-10 font-semibold">
                <SortIcon order={sorting.order} />
              </div>
            )}
            Transfers (24H)
          </button>
        </span>
      ),
      key: 'change_24',
      cell: (row: Token) => (
        <span>{row?.transfers_day ? localFormat(row?.transfers_day) : ''}</span>
      ),
      tdClassName:
        'px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 align-top',
      thClassName: 'w-[160px]',
    },
  ];

  return (
    <>
      <div className="bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl pb-1 ">
        <div className="flex flex-row items-center justify-between text-left text-sm text-nearblue-600 dark:text-neargray-10 px-3 py-2">
          <p className="pl-3">
            {tokens?.length > 0 &&
              count > 0 &&
              `A total of ${localFormat && localFormat(count.toString())}${' '}
              NEP-171 Token Contracts found`}
          </p>
          <div className="flex w-full h-10 sm:w-80 mr-2" ref={containerRef}>
            <div className="flex-grow">
              <label htmlFor="token-search" id="token-search">
                <input
                  name="search"
                  autoComplete="off"
                  placeholder="Search"
                  className="search ml-2 pl-8 token-search bg-white dark:bg-black-600 dark:border-black-200 w-full h-full text-sm py-2 outline-none border rounded-xl"
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
                          href={`/nft-token/${token?.contract}`}
                          className="flex items-center my-1 whitespace-nowrap "
                        >
                          <div className="flex-shrink-0 h-5 w-5 mr-2">
                            <TokenImage
                              src={token?.icon}
                              alt={token?.name}
                              className="w-5 h-5"
                            />
                          </div>
                          <p className="font-semibold text-sm truncate">
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
          count={count}
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
    </>
  );
};
export default List;
