'use client';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { useConfig } from '@/hooks/app/useConfig';
import { Link, routing, useIntlRouter } from '@/i18n/routing';
import { rpcSearch } from '@/utils/app/rpc';
import { localFormat, shortenAddress, shortenHex } from '@/utils/libs';
import { NetworkId, SearchResult, SearchRoute } from '@/utils/types';

import ArrowDown from '@/components/app/Icons/ArrowDown';
import SearchIcon from '@/components/app/Icons/SearchIcon';
import { Spinner } from '@/components/app/common/Spinner';
import useStatsStore from '@/stores/app/syncStats';
import { handleFilterAndKeyword } from '@/utils/app/actions';
import { locales } from '@/utils/app/config';

export const SearchToast = (networkId: NetworkId) => {
  if (networkId === 'testnet') {
    return (
      <div>
        No results. Try on{' '}
        <Link className="text-green-500" href="https://nearblocks.io">
          Mainnet
        </Link>
      </div>
    );
  }

  return (
    <div>
      No results. Try on{' '}
      <Link className="text-green-500" href="https://testnet.nearblocks.io">
        Testnet
      </Link>
    </div>
  );
};

export const getSearchRoute = (res: SearchResult): SearchRoute | null => {
  if (res.blocks?.[0]?.block_hash) {
    return {
      path: res.blocks[0].block_hash,
      type: 'block',
    };
  }

  if (res.txns?.[0]?.transaction_hash) {
    return {
      path: res.txns[0].transaction_hash,
      type: 'txn',
    };
  }

  if (res.receipts?.[0]?.originated_from_transaction_hash) {
    return {
      path: res.receipts[0].originated_from_transaction_hash,
      type: 'txn',
    };
  }

  if (res.accounts?.[0]?.account_id) {
    return {
      path: res.accounts[0].account_id,
      type: 'address',
    };
  }

  if (res.tokens?.[0]?.contract) {
    return {
      path: res.tokens[0].contract,
      type: 'token',
    };
  }

  if (res?.mtTokens?.[0]?.contract && res?.mtTokens?.[0]?.token_id) {
    return {
      path: `${res?.mtTokens?.[0]?.contract}:${res?.mtTokens?.[0]?.token_id}`,
      type: 'mt_token',
    };
  }
  return null;
};

const t = (key: string, p?: any): any => {
  p = {};
  const simulateAbsence = true;
  return simulateAbsence ? undefined : { key, p };
};

const BaseSearch = ({
  disabled,
  header = false,
  pathname,
  onRedirect,
}: {
  disabled?: boolean;
  header?: boolean;
  pathname?: string;
  onRedirect: (newPath: string, pathname?: string) => Promise<void>;
}) => {
  const [keyword, setKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<any>({});
  const [filter, setFilter] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef: any = useRef<HTMLDivElement>(null);
  const indexers = useStatsStore((state) => state.syncStatus);
  const isLocale = (value: null | string): any => {
    return routing?.locales?.includes(value as any);
  };

  const { networkId } = useConfig();

  const homeSearch = pathname && isLocale(pathname) ? pathname : '/';

  type SearchResultItem = {
    type: string;
    data: SearchResult;
    value: string;
  };

  const flatResults = React.useMemo(() => {
    const items: SearchResultItem[] = [];
    if (result?.accounts?.length) {
      result.accounts.forEach((acc: any) =>
        items.push({ type: 'address', data: acc, value: acc.account_id }),
      );
    }
    if (result?.txns?.length) {
      result.txns.forEach((txn: any) =>
        items.push({ type: 'txn', data: txn, value: txn.transaction_hash }),
      );
    }
    if (result?.receipts?.length) {
      result.receipts.forEach((receipt: any) =>
        items.push({
          type: 'receipt',
          data: receipt,
          value: receipt.originated_from_transaction_hash,
        }),
      );
    }
    if (result?.blocks?.length) {
      result.blocks.forEach((block: any) =>
        items.push({ type: 'block', data: block, value: block.block_height }),
      );
    }
    if (result?.tokens?.length) {
      result.tokens.forEach((token: any) =>
        items.push({ type: 'token', data: token, value: token.contract }),
      );
    }
    if (result?.mtTokens?.length) {
      result.mtTokens.forEach((token: any) =>
        items.push({
          type: 'mt_token',
          data: token,
          value: `${token.contract}:${token.token_id}`,
        }),
      );
    }
    return items;
  }, [result]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [result]);

  useEffect(() => {
    if (selectedIndex >= 0 && flatResults[selectedIndex]) {
      setInputValue(flatResults[selectedIndex].value);
    } else if (selectedIndex === -1) {
      setInputValue(keyword);
    }
  }, [selectedIndex, flatResults, keyword]);

  const redirect = async (route: SearchRoute | null) => {
    const newPath =
      route?.type === 'block'
        ? `/blocks/${route?.path}`
        : route?.type === 'txn' || route?.type === 'receipt'
        ? `/txns/${route?.path}`
        : route?.type === 'address'
        ? `/address/${route?.path}`
        : route?.type === 'token'
        ? `/token/${route?.path}`
        : route?.type === 'mt_token'
        ? `/mt-token/${route?.path}`
        : null;

    if (newPath === pathname) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    if (newPath) {
      await onRedirect(newPath, pathname);
    } else {
      toast.error(SearchToast(networkId));
    }
  };

  const reset = () => {
    setResult({});
    setKeyword('');
    setInputValue('');
    setIsOpen(false);
    setIsLoading(false);
    setSelectedIndex(-1);
  };

  useEffect(() => {
    setIsLoading(false);
    reset();
  }, [pathname]);

  const showResults =
    result?.blocks?.length > 0 ||
    result?.txns?.length > 0 ||
    result?.accounts?.length > 0 ||
    result?.receipts?.length > 0 ||
    result?.tokens?.length > 0 ||
    result?.mtTokens?.length > 0;

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      if (!keyword) {
        setResult({});
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await handleFilterAndKeyword(keyword, filter);
        if (!isActive) return;
        if (data?.data) {
          if (isActive) {
            setResult(data.data);
            setIsLoading(false);
          }
          return;
        }
        const dataV3 = await handleFilterAndKeyword(keyword, filter, 'v3');
        if (!isActive) return;

        if (dataV3?.data) {
          if (isActive) {
            setResult(dataV3.data);
            setIsLoading(false);
          }
          return;
        }
        if (indexers?.base && !indexers?.base?.sync) {
          const rpcData = await rpcSearch(keyword);
          if (!isActive) return;
          if (filter !== '/tokens' && isActive) {
            setResult(rpcData?.data ?? {});
          }
        } else {
          const fallbackRpcData = await rpcSearch(keyword);
          if (!isActive) return;
          if (filter !== '/tokens' && isActive) {
            setResult(fallbackRpcData?.data ?? {});
          }
        }
      } catch (error) {
        if (!isActive) return;
        console.error('Error in fetchData:', error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, keyword]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((nextValue) => setKeyword(nextValue), 500),
    [],
  );

  const handleChange = (event: any) => {
    const { value: nextValue } = event.target;
    setInputValue(nextValue);
    const sanitized = nextValue.replace(/[\s,]/g, '');
    if (sanitized === '') {
      setResult({});
      debouncedSave.cancel();
      setKeyword('');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    debouncedSave(sanitized);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || !flatResults.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prev) => Math.max(-1, prev - 1));
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && flatResults[selectedIndex]) {
          const selected = flatResults[selectedIndex];
          setInputValue(selected.value);
          setKeyword(selected.value);
          onSelect({ path: selected.value, type: selected.type });
        } else {
          onSubmit(event);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const onFilter = (event: any) => setFilter(event.target.value);

  const onSelect = (item: any) => redirect(item);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        event.target &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/') {
        event.preventDefault();
        document.getElementById('searchInput')?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onSubmit = async (event: any) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }
    const query = inputValue.replace(/[\s,]/g, '');
    if (!query) {
      return toast.error(SearchToast(networkId));
    }
    setIsLoading(true);
    const data = await handleFilterAndKeyword(query, filter);
    const route = data?.data && getSearchRoute(data?.data);
    if (route) {
      return redirect(route);
    } else {
      const rpcData = await rpcSearch(query);
      const rpcRoute = rpcData?.data && getSearchRoute(rpcData?.data);
      if (rpcRoute) {
        return redirect(rpcRoute);
      } else {
        setIsLoading(false);
        return toast.error(SearchToast(networkId));
      }
    }
  };

  const getItemIndex = (type: string, index: number) => {
    let count = 0;
    const typeMap: { [key: string]: string } = {
      accounts: 'address',
      txns: 'txn',
      receipts: 'receipt',
      blocks: 'block',
      tokens: 'token',
      mtTokens: 'mt_token',
    };

    for (const [key, val] of Object.entries(typeMap)) {
      if (val === type) {
        return count + index;
      }
      count += result[key]?.length || 0;
    }
    return -1;
  };

  return (
    <form
      className={`flex w-full ${header ? 'h-9' : 'h-12'}`}
      onSubmit={onSubmit}
    >
      <label className=" relative hidden md:flex justify-center">
        <select
          className={`${
            disabled ? '!opacity-100' : ''
          } h-full block text-sm text-nearblue-600 dark:bg-black dark:text-neargray-10 ${
            homeSearch
              ? 'bg-gray-100 dark:bg-black-500 dark:text-neargray-10'
              : 'bg-blue-900/[0.05] dark:bg-black dark:text-neargray-10'
          }  pl-4 pr-9  cursor-pointer focus:outline-none appearance-none rounded-none rounded-l-lg border dark:border-black-200 dark:text-neargray-10`}
          disabled={disabled}
          onChange={onFilter}
          value={filter}
        >
          <option value="">{t('search.filters.all') || 'All Filters'}</option>
          <option value="/txns">{t('search.filters.txns') || 'Txns'}</option>
          <option value="/blocks">
            {t('search.filters.blocks') || 'Blocks'}
          </option>
          <option value="/accounts">
            {t('search.filters.addresses') || 'Addresses'}
          </option>
          <option value="/tokens">
            {t('search.filters.token') || 'Tokens'}
          </option>
        </select>
        <ArrowDown
          className={`absolute right-3 ${
            header ? 'top-3' : 'top-4'
          } w-4 h-4 fill-current text-nearblue-600 dark:text-neargray-10 pointer-events-none`}
        />
      </label>

      <div className="flex-grow w-full relative" ref={containerRef}>
        <input
          className={`search relative ${
            disabled ? 'opacity-100' : ''
          } bg-white dark:bg-black-600 dark:text-neargray-10 w-full h-full text-sm px-4 py-3 outline-none dark:border-black-200 border-l border-t border-b md:border-l-0 rounded-l-lg rounded-r-none md:rounded-l-none`}
          disabled={disabled}
          id="searchInput"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          placeholder={
            t('search.placeholder') || 'Search by Account ID / Txn Hash / Block'
          }
        />
        {isOpen && showResults && (
          <div className="z-10 absolute w-full dark:bg-black-600 text-xs rounded-b-lg bg-gray-50 pt-2 shadow border dark:border-black-200">
            <>
              {result?.accounts?.length > 0 && (
                <>
                  <h3 className="mx-2 px-2 py-1.5 text-sm bg-gray-100 dark:text-neargray-10 dark:bg-black-200 rounded">
                    {t('search.list.address') || 'Account'}
                  </h3>
                  {result?.accounts?.map((address: any, idx: number) => {
                    const itemIdx = getItemIndex('address', idx);
                    return (
                      <div className="px-2 py-1" key={address.account_id}>
                        <div
                          className={`px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:text-neargray-10 cursor-pointer rounded hover:border-gray-500 truncate ${
                            selectedIndex === itemIdx
                              ? 'bg-gray-100 dark:bg-black-200'
                              : ''
                          }`}
                          onClick={() =>
                            onSelect({
                              path: address.account_id,
                              type: 'address',
                            })
                          }
                        >
                          {shortenAddress(address.account_id)}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              {result?.txns?.length > 0 && (
                <>
                  <h3 className="mx-2 px-2 py-1.5 text-sm bg-gray-100 dark:text-neargray-10 dark:bg-black-200 rounded">
                    {t('search.list.txns') || 'Txns'}
                  </h3>
                  {result.txns.map((txn: any, idx: number) => {
                    const itemIdx = getItemIndex('txn', idx);
                    return (
                      <div className="px-2 py-1" key={txn.transaction_hash}>
                        <div
                          className={`px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:text-neargray-10 rounded cursor-pointer hover:border-gray-500 truncate ${
                            selectedIndex === itemIdx
                              ? 'bg-gray-100 dark:bg-black-200'
                              : ''
                          }`}
                          onClick={() =>
                            onSelect({
                              path: txn.transaction_hash,
                              type: 'txn',
                            })
                          }
                        >
                          {shortenHex(txn.transaction_hash)}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              {result?.receipts?.length > 0 && (
                <>
                  <h3 className="mx-2 px-2 py-1.5 text-sm bg-gray-100 dark:text-neargray-10 dark:bg-black-200 rounded">
                    {t('search.list.receipts') || 'Receipts'}
                  </h3>
                  {result.receipts.map((receipt: any, idx: number) => {
                    const itemIdx = getItemIndex('receipt', idx);
                    return (
                      <div className="px-2 py-1" key={receipt.receipt_id}>
                        <div
                          className={`px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:text-neargray-10 rounded cursor-pointer hover:border-gray-500 truncate ${
                            selectedIndex === itemIdx
                              ? 'bg-gray-100 dark:bg-black-200'
                              : ''
                          }`}
                          onClick={() =>
                            onSelect({
                              path: receipt.originated_from_transaction_hash,
                              type: 'receipt',
                            })
                          }
                        >
                          {shortenHex(receipt.receipt_id)}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              {result?.blocks?.length > 0 && (
                <>
                  <h3 className="mx-2 px-2 py-1.5 text-sm bg-gray-100 dark:text-neargray-10 dark:bg-black-200 rounded">
                    {t('search.list.blocks') || 'Blocks'}
                  </h3>
                  {result.blocks.map((block: any, idx: number) => {
                    const itemIdx = getItemIndex('block', idx);
                    return (
                      <div className="px-2 py-1" key={block.block_hash}>
                        <div
                          className={`px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:text-neargray-10 rounded cursor-pointer hover:border-gray-500 truncate ${
                            selectedIndex === itemIdx
                              ? 'bg-gray-100 dark:bg-black-200'
                              : ''
                          }`}
                          onClick={() =>
                            onSelect({
                              path: block.block_hash,
                              type: 'block',
                            })
                          }
                        >
                          #{localFormat(block.block_height)} (0x
                          {shortenHex(block.block_hash)})
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              {result?.tokens?.length > 0 && (
                <>
                  <h3 className=" mx-2 px-2 py-1.5 text-sm bg-gray-100 dark:text-neargray-10 dark:bg-black-200 rounded">
                    {t('search.list.tokens') || 'Tokens'}
                  </h3>
                  {result.tokens.map((token: any, idx: number) => {
                    const itemIdx = getItemIndex('token', idx);
                    return (
                      <div className="px-2 py-1" key={token.contract}>
                        <div
                          className={`px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:text-neargray-10 rounded cursor-pointer hover:border-gray-500 truncate ${
                            selectedIndex === itemIdx
                              ? 'bg-gray-100 dark:bg-black-200'
                              : ''
                          }`}
                          onClick={() =>
                            onSelect({
                              path: token.contract,
                              type: 'token',
                            })
                          }
                        >
                          {shortenAddress(token.contract)}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              {result?.mtTokens?.length > 0 && (
                <>
                  <h3 className=" mx-2 px-2 py-1.5 text-sm bg-gray-100 dark:text-neargray-10 dark:bg-black-200 rounded">
                    Multi Tokens
                  </h3>
                  {result?.mtTokens?.map(
                    (
                      token: { contract: string; token_id: string },
                      idx: number,
                    ) => {
                      const itemIdx = getItemIndex('mt_token', idx);
                      return (
                        <div className="px-2 py-1" key={token.contract}>
                          <div
                            className={`px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:text-neargray-10 rounded cursor-pointer hover:border-gray-500 truncate ${
                              selectedIndex === itemIdx
                                ? 'bg-gray-100 dark:bg-black-200'
                                : ''
                            }`}
                            onClick={() =>
                              onSelect({
                                path: `${token?.contract}:${token?.token_id}`,
                                type: 'mt_token',
                              })
                            }
                          >
                            {shortenAddress(token.token_id)}
                          </div>
                        </div>
                      );
                    },
                  )}
                </>
              )}
            </>
          </div>
        )}
      </div>
      <button
        className={`${
          homeSearch
            ? 'bg-gray-100 dark:bg-black-500'
            : 'bg-blue-900/[0.05] dark:bg-black-600'
        } rounded-r-lg px-5 outline-none focus:outline-none border dark:border-black-200`}
        disabled={disabled}
        type="submit"
      >
        {isLoading ? (
          <Spinner />
        ) : (
          <SearchIcon className="text-gray-700 dark:text-gray-100 fill-current " />
        )}
      </button>
    </form>
  );
};

export const SearchWithGlobalError = ({
  disabled,
  header = false,
  pathname,
}: {
  disabled?: boolean;
  header?: boolean;
  pathname?: string;
}) => {
  // handleRedirect navigates to a new path with locale, used in Global Error Boundary for full reload to reset app state.
  const handleRedirect = async (newPath: string) => {
    const locale = window.location.pathname?.match(
      new RegExp(`^/(${locales.join('|')})(?=/|$)`),
    )?.[1];
    const path = locale ? `/${locale}${newPath}` : newPath;
    window.location.assign(path);
  };

  return (
    <BaseSearch
      disabled={disabled}
      header={header}
      pathname={pathname}
      onRedirect={handleRedirect}
    />
  );
};

export const SearchWithRouter = ({
  disabled,
  header = false,
  pathname,
}: {
  disabled?: boolean;
  header?: boolean;
  pathname?: string;
}) => {
  const router = useIntlRouter();

  const handleRedirect = async (newPath: string) => {
    if (router) {
      return router.push(newPath);
    }
  };

  return (
    <BaseSearch
      disabled={disabled}
      header={header}
      pathname={pathname}
      onRedirect={handleRedirect}
    />
  );
};

const Search = ({
  disabled,
  header = false,
  pathname,
  globalError,
}: {
  disabled?: boolean;
  header?: boolean;
  pathname?: string;
  globalError?: boolean;
}) => {
  if (globalError) {
    return (
      <SearchWithGlobalError
        disabled={disabled}
        header={header}
        pathname={pathname}
      />
    );
  }

  return (
    <SearchWithRouter disabled={disabled} header={header} pathname={pathname} />
  );
};

export default Search;
