'use client';
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from '@reach/combobox';
import debounce from 'lodash/debounce';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useConfig } from '@/hooks/app/useConfig';
import { routing, useIntlRouter } from '@/i18n/routing';
import { localFormat, shortenAddress, shortenHex } from '@/utils/libs';
import { NetworkId } from '@/utils/types';

import ArrowDown from '../Icons/ArrowDown';
import SearchIcon from '../Icons/SearchIcon';

export const SearchToast = ({ networkId }: any) => {
  if (networkId === 'testnet') {
    return (
      <div>
        No results. Try on{' '}
        <Link href="https://nearblocks.io" legacyBehavior>
          <a className="text-green-500">Mainnet</a>
        </Link>
      </div>
    );
  }

  return (
    <div>
      No results. Try on{' '}
      <Link href="https://testnet.nearblocks.io" legacyBehavior>
        <a className="text-green-500">Testnet</a>
      </Link>
    </div>
  );
};

const t = (key: string, p?: any): any => {
  p = {};
  const simulateAbsence = true;
  return simulateAbsence ? undefined : { key, p };
};

const Search = ({ disabled, handleFilterAndKeyword, header = false }: any) => {
  const router = useIntlRouter();
  const pathname = usePathname();
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState<any>({});
  const [filter, setFilter] = useState('');
  const isLocale = (value: null | string): any => {
    return routing?.locales?.includes(value as any);
  };

  const { networkId } = useConfig();

  const homeSearch = pathname && isLocale(pathname) ? pathname : '/';

  const redirect = (route: any) => {
    switch (route?.type) {
      case 'block':
        return router.push(`/blocks/${route?.path}`);
      case 'txn':
        return router.push(`/txns/${route?.path}`);
      case 'receipt':
        return router.push(`/txns/${route?.path}`);
      case 'address':
        return router.push(`/address/${route?.path}`);
      default:
        return toast.error(SearchToast(networkId as NetworkId));
    }
  };

  const showResults =
    result?.blocks?.length > 0 ||
    result?.txns?.length > 0 ||
    result?.accounts?.length > 0 ||
    result?.receipts?.length > 0;

  useEffect(() => {
    if (keyword) {
      handleFilterAndKeyword(keyword, filter).then((data: any) =>
        setResult(data || {}),
      );
    }
  }, [filter, keyword, handleFilterAndKeyword]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((nextValue) => setKeyword(nextValue), 500),
    [],
  );

  const handleChange = (event: any) => {
    const { value: nextValue } = event.target;
    debouncedSave(nextValue.replace(/[\s,]/g, ''));
  };

  const onFilter = (event: any) => setFilter(event.target.value);

  const onSelect = (item: any) => redirect(item);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === '/') {
        event.preventDefault();
        const searchInput = document.getElementById('searchInput');
        searchInput?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const onSubmit = async (event: any) => {
    event.preventDefault();

    const text = (
      document.getElementsByClassName('search')[0] as HTMLInputElement
    ).value;
    const query = text.replace(/[\s,]/g, '');

    if (!query) return toast.error(SearchToast(networkId as NetworkId));

    const route = await handleFilterAndKeyword(query, filter, true);

    if (route) {
      return redirect(route);
    }

    return toast.error(SearchToast(networkId as NetworkId));
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
        </select>
        <ArrowDown
          className={`absolute right-3 ${
            header ? 'top-3' : 'top-4'
          } w-4 h-4 fill-current text-nearblue-600 dark:text-neargray-10 pointer-events-none`}
        />
      </label>

      <Combobox className="flex-grow">
        <ComboboxInput
          className={`search ${
            disabled ? 'opacity-100' : ''
          } !bg-white dark:bg-black-600 dark:text-neargray-10 w-full h-full text-sm px-4 py-3 outline-none dark:border-black-200 border-l border-t border-b md:border-l-0 rounded-l-lg rounded-r-none md:rounded-l-none`}
          disabled={disabled}
          id="searchInput"
          onChange={handleChange}
          placeholder={
            t('search.placeholder') || 'Search by Account ID / Txn Hash / Block'
          }
        />
        {showResults && (
          <ComboboxPopover className="z-50 dark:bg-black-600">
            <ComboboxList className="text-xs rounded-b-lg  bg-gray-50 py-2 shadow border dark:border-black-200 dark:bg-black-600">
              {result?.accounts?.length > 0 && (
                <>
                  <h3 className=" mx-2 my-2 px-2 py-2 text-sm bg-gray-100 dark:text-neargray-10 dark:bg-black-200 rounded">
                    {t('search.list.address') || 'Account'}
                  </h3>
                  {result?.accounts?.map((address: any) => (
                    <ComboboxOption
                      className="mx-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:text-neargray-10 cursor-pointer rounded hover:border-gray-500 truncate"
                      key={address.account_id}
                      onClick={() =>
                        onSelect({ path: address.account_id, type: 'address' })
                      }
                      value={address.account_id}
                    >
                      {shortenAddress(address.account_id)}
                    </ComboboxOption>
                  ))}
                </>
              )}
              {result?.txns?.length > 0 && (
                <>
                  <h3 className=" mx-2 my-2 px-2 py-2 text-sm bg-gray-100 dark:text-neargray-10 dark:bg-black-200 rounded">
                    {t('search.list.txns') || 'Txns'}
                  </h3>
                  {result.txns.map((txn: any) => (
                    <ComboboxOption
                      className="mx-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:text-neargray-10 rounded cursor-pointer hover:border-gray-500 truncate"
                      key={txn.transaction_hash}
                      onClick={() =>
                        onSelect({ path: txn.transaction_hash, type: 'txn' })
                      }
                      value={txn.transaction_hash}
                    >
                      {shortenHex(txn.transaction_hash)}
                    </ComboboxOption>
                  ))}
                </>
              )}
              {result?.receipts?.length > 0 && (
                <>
                  <h3 className=" mx-2 my-2 px-2 py-2 text-sm bg-gray-100 dark:text-neargray-10 dark:bg-black-200 rounded">
                    {t('search.list.receipts') || 'Receipts'}
                  </h3>
                  {result.receipts.map((receipt: any) => (
                    <ComboboxOption
                      className="mx-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:text-neargray-10 rounded cursor-pointer hover:border-gray-500 truncate"
                      key={receipt.receipt_id}
                      onClick={() =>
                        onSelect({
                          path: receipt.originated_from_transaction_hash,
                          type: 'receipt',
                        })
                      }
                      value={receipt.receipt_id}
                    >
                      {shortenHex(receipt.receipt_id)}
                    </ComboboxOption>
                  ))}
                </>
              )}
              {result?.blocks?.length > 0 && (
                <>
                  <h3 className=" mx-2 my-2 px-2 py-2 text-sm bg-gray-100 dark:text-neargray-10 dark:bg-black-200 rounded">
                    {t('search.list.blocks') || 'Blocks'}
                  </h3>
                  {result.blocks.map((block: any) => (
                    <ComboboxOption
                      className="mx-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-black-200 dark:text-neargray-10 rounded cursor-pointer hover:border-gray-500 truncate"
                      key={block.block_hash}
                      onClick={() =>
                        onSelect({ path: block.block_hash, type: 'block' })
                      }
                      value={block.block_hash}
                    >
                      #{localFormat(block.block_height)} (0x
                      {shortenHex(block.block_hash)})
                    </ComboboxOption>
                  ))}
                </>
              )}
            </ComboboxList>
          </ComboboxPopover>
        )}
      </Combobox>
      <button
        className={`${
          homeSearch
            ? 'bg-gray-100 dark:bg-black-500'
            : 'bg-blue-900/[0.05] dark:bg-black-600'
        } rounded-r-lg px-5 outline-none focus:outline-none border dark:border-black-200`}
        disabled={disabled}
        type="submit"
      >
        <SearchIcon className="text-gray-700 dark:text-gray-100 fill-current " />
      </button>
    </form>
  );
};

export default Search;
