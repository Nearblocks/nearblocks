'use client';
import classNames from 'classnames';
import React from 'react';

import { Link } from '@/i18n/routing';

import FAQ from './FAQ';
import Info from './Info';
import TokenTxnsTab from './TokenTxnsTab';
import Holders from './Holders';
import ErrorMessage from '../../common/ErrorMessage';
import FaInbox from '../../Icons/FaInbox';
interface Props {
  className?: string;
  error?: boolean;
  tab: any;
  id: string;
}
const TokenOverviewSkeleton = ({ error, tab, id }: Props) => {
  const getClassName = (selected: boolean) =>
    classNames(
      'text-xs leading-4 font-medium overflow-hidden inline-block cursor-pointer p-2 mb-3 mr-2 focus:outline-none rounded-lg',
      {
        'bg-green-600 dark:bg-green-250 text-white': selected,
        'hover:bg-neargray-800 dark:hover:bg-black-100 bg-neargray-700 dark:bg-black-200 hover:text-nearblue-600 text-nearblue-600 dark:text-neargray-10':
          !selected,
      },
    );

  const tabs = [
    { label: 'Transfers', message: 'fts.ft.transfers', name: 'transfers' },
    { label: 'Holders', message: 'fts.ft.holders', name: 'holders' },
    { label: 'Info', message: 'fts.ft.info', name: 'info' },
    { label: 'FAQ', message: 'fts.ft.faq', name: 'faq' },
  ];
  return (
    <>
      <div className="block lg:flex lg:space-x-2 mb-4">
        <div className="w-full">
          <div className="flex flex-wrap ">
            {tabs?.map(({ label, name }) => {
              return (
                <Link
                  className={getClassName(name === tab)}
                  href={
                    name === 'transfers'
                      ? `/token/${id}`
                      : `/token/${id}?tab=${name}`
                  }
                  key={name}
                >
                  <h2>{label}</h2>
                </Link>
              );
            })}
          </div>

          <div className="relative">
            <div
              className={`bg-white dark:bg-black-600 border dark:border-black-200 soft-shadow rounded-xl overflow-hidden`}
            >
              {error ? (
                <div className="w-full">
                  <ErrorMessage
                    icons={<FaInbox />}
                    message={''}
                    mutedText="Please try again later"
                    reset
                  />
                </div>
              ) : (
                <>
                  {tab === 'holders' ? (
                    <Holders />
                  ) : tab === 'info' ? (
                    <Info />
                  ) : tab === 'faq' ? (
                    <FAQ />
                  ) : (
                    <TokenTxnsTab />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="py-8"></div>
    </>
  );
};
TokenOverviewSkeleton.displayName = 'Overview';
export default TokenOverviewSkeleton;
