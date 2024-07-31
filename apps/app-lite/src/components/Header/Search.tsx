import { useDebounceFn } from 'ahooks';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef } from 'react';

import { useSearch } from '@/hooks/useSearch';
import {
  numberFormat,
  shortenAddress,
  shortenHash,
  yoctoToNear,
} from '@/libs/utils';

import Address from '../Icons/Address';
import Block from '../Icons/Block';
import SearchIcon from '../Icons/Search';
import Txn from '../Icons/Txn';
import Warning from '../Icons/Warning';
import Skeleton from '../Skeleton';

type SearchProps = {
  className?: string;
  dropdownClassName?: string;
};

const Search = ({ className, dropdownClassName }: SearchProps) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { loading, results, search } = useSearch();
  const { run } = useDebounceFn(
    () => {
      const text = inputRef.current?.value;
      const query = text?.replace(/[\s,]/g, '');

      search(query);
    },
    { wait: 350 },
  );

  useEffect(() => {
    const onRouteChange = () => inputRef.current?.blur();

    router.events.on('routeChangeStart', onRouteChange);

    return () => {
      router.events.off('routeChangeStart', onRouteChange);
    };
  }, [router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = inputRef.current?.value;
    const query = text?.replace(/[\s,]/g, '');

    const resp = await search(query);

    if (resp?.account)
      return router.push(`/address/${resp.query.toLowerCase()}`);
    if (resp?.block) return router.push(`/blocks/${resp.query}`);
    if (resp?.txn) return router.push(`/txns/${resp.query}`);
    if (resp?.receipt)
      return router.push(`/txns/${resp.receipt.parent_transaction_hash}`);

    return;
  };

  return (
    <form
      autoCapitalize="none"
      autoComplete="off"
      className={`relative flex-grow px-5 ${
        results.query ? 'rounded-t-lg' : 'rounded-lg'
      } ${className}`}
      onSubmit={onSubmit}
    >
      <label className="peer flex items-center flex-grow">
        <SearchIcon className="text-primary h-4" />
        <input
          className="bg-transparent w-full h-9 text-text-input outline-none pl-3"
          id="search"
          onChange={run}
          placeholder="Find a transaction, account or block"
          ref={inputRef}
          type="text"
        />
      </label>
      {results.query && (
        <div className="hidden peer-has-[:focus]:block has-[:active]:block has-[:hover]:block absolute top-full right-0 left-0">
          <ul
            className={`whitespace-nowrap text-sm space-y-4 bg-bg-box shadow pb-6 ${dropdownClassName}`}
          >
            <li className="border-t border-border-body" />
            {loading && (
              <li>
                <div className="flex items-center h-7 pl-6 pr-6 md:pl-5 md:pr-6">
                  <span className="w-7 inline-flex">
                    <Skeleton loading>
                      <span className="h-5 w-4 inline-flex" />
                    </Skeleton>
                  </span>
                  <Skeleton loading>
                    <span className="h-5 w-40 inline-flex" />
                  </Skeleton>
                </div>
              </li>
            )}
            {!loading &&
              !results.account &&
              !results.block &&
              !results.txn &&
              !results.receipt && (
                <li>
                  <div className="flex items-center text-base text-text-input h-7 pl-6 pr-6 md:pl-5 md:pr-6">
                    <span className="w-7">
                      <Warning className="h-4 w-4" />
                    </span>
                    No results found
                  </div>
                </li>
              )}
            {!loading && results.account && (
              <li>
                <Link
                  className="flex items-center justify-between text-lg hover:text-primary h-7 pl-6 pr-6 md:pl-5 md:pr-6 text-ellipsis overflow-hidden"
                  href={`/address/${results.query.toLocaleLowerCase()}`}
                >
                  <span className="flex items-center">
                    <span className="w-7 flex-shrink-0">
                      <Address className="text-primary w-4" />
                    </span>
                    {shortenAddress(results.query.toLocaleLowerCase())}
                  </span>
                  <span className="text-text-input text-base">
                    {numberFormat(yoctoToNear(results.account.amount), 2)} Ⓝ
                  </span>
                </Link>
              </li>
            )}
            {!loading && results.block && (
              <li>
                <Link
                  className="flex items-center justify-between text-base hover:text-primary h-7 pl-6 pr-6 md:pl-5 md:pr-6"
                  href={`/blocks/${results.query}`}
                >
                  <span className="flex items-center">
                    <span className="w-7 flex-shrink-0">
                      <Block className="text-primary w-4" />
                    </span>
                    {numberFormat(String(results.block.header.height))}
                  </span>
                  <span className="text-text-input text-base">
                    {shortenHash(results.block.header.hash)}
                  </span>
                </Link>
              </li>
            )}
            {!loading && results.txn && (
              <li>
                <Link
                  className="flex items-center justify-between text-base hover:text-primary h-7 pl-6 pr-6 md:pl-5 md:pr-6"
                  href={`/txns/${results.query}`}
                >
                  <span className="flex items-center">
                    <span className="w-7 flex-shrink-0">
                      <Txn className="text-primary w-4" />
                    </span>
                    {shortenHash(results.txn.transaction.hash)}
                  </span>
                </Link>
              </li>
            )}
            {!loading && results.receipt && (
              <li>
                <Link
                  className="flex items-center justify-between text-base hover:text-primary h-7 pl-6 pr-6 md:pl-5 md:pr-6"
                  href={`/txns/${results.receipt.parent_transaction_hash}`}
                >
                  <span className="flex items-center">
                    <span className="w-7 flex-shrink-0">
                      <Txn className="text-primary w-4" />
                    </span>
                    {shortenHash(results.receipt.parent_transaction_hash)}
                  </span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </form>
  );
};

export default Search;
