'use client';

import { useTranslations } from 'next-intl';
import React, { useRef, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';

import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '@/components/ui/popover';
import { chainAbstractionExplorerUrl } from '@/utils/app/config';
import { shortenHex } from '@/utils/app/libs';

import ArrowDown from '../Icons/ArrowDown';
import Bitcoin from '../Icons/Bitcoin';
import Ethereum from '../Icons/Ethereum';
import FaExternalLinkAlt from '../Icons/FaExternalLinkAlt';

interface Props {
  multiChainAccounts: any;
}
const MultichainInfoActions = ({ multiChainAccounts }: Props) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<null | number>(null);
  const t = useTranslations();

  const handleChainSelect = (chain: string, address: string) => {
    const url =
      chain in chainAbstractionExplorerUrl
        ? chainAbstractionExplorerUrl[
            chain as keyof typeof chainAbstractionExplorerUrl
          ]?.address(address)
        : '';

    url ? window.open(url, '_blank') : '';
  };

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-1">
      <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl">
        <h2 className="leading-6 border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
          {t ? t('multichainInfo') : 'Multichain Information'}
        </h2>
        <div className="px-3 py-4 text-sm text-nearblue-600 dark:text-neargray-10 flex flex-wrap items-center">
          <div className="flex w-full flex-wrap items-center gap-2 md:gap-4">
            <span className="flex-shrink-0">
              {multiChainAccounts?.length
                ? multiChainAccounts?.length
                : t
                ? t('noAddresses')
                : 'No'}{' '}
              {multiChainAccounts?.length === 1
                ? t
                  ? t('address')
                  : 'address'
                : t
                ? t('addresses')
                : 'addresses'}{' '}
              {t ? t('foundOn') : 'found on:'}
            </span>
            <PopoverRoot positioning={{ sameWidth: true }}>
              <PopoverTrigger
                asChild
                className={`relative min-w-[8rem] h-8 text-sm px-2 rounded border dark:border-black-200 flex items-center focus:outline-none justify-between ${
                  multiChainAccounts?.length
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed'
                }`}
                disabled={!multiChainAccounts?.length}
                ref={buttonRef}
              >
                <button>
                  <span>{t ? t('foreignChain') : 'Foreign Chain'}</span>
                  <ArrowDown className="w-4 h-4 ml-2 fill-current text-gray-500 pointer-events-none" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className={`focus:outline-none -mt-1.5 xl:-left-0 lg:-left-32 md:-left-0 -left-32 max-w-min bg-white shadow border z-20 dark:border-black-200 dark:bg-black p-1.5 overflow-hidden`}
                rounded={'lg'}
                width={'48'}
              >
                <div className="dark:bg-black">
                  <PerfectScrollbar>
                    <div className="max-h-60 dark:bg-black lg:overflow-visible overflow-y-scroll">
                      {multiChainAccounts?.map((address: any, index: any) => (
                        <div
                          className=" dark:bg-black flex justify-between items-center px-1.5 py-1 hover:bg-gray-100 dark:hover:bg-black-200 truncate cursor-pointer rounded-lg"
                          key={index}
                          onClick={() =>
                            handleChainSelect(
                              address.chain.toLowerCase(),
                              address.derived_address,
                            )
                          }
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        >
                          {address?.chain && (
                            <div className="flex items-center justify-between w-full ">
                              <div className="flex items-center">
                                <div className="p-0.5 w-5 h-5 flex items-center justify-center bg-gray-100 dark:bg-black-200 rounded border dark:border-neargray-50">
                                  {address.chain === 'BITCOIN' && (
                                    <Bitcoin className="w-4 h-4 text-orange-400" />
                                  )}
                                  {address.chain === 'ETHEREUM' && (
                                    <Ethereum className="w-4 h-4 text-nearblue-600 dark:text-neargray-10" />
                                  )}
                                </div>
                                <span className="ml-2 text-nearblue-600 dark:text-neargray-10">
                                  {address.path
                                    .toLowerCase()
                                    .includes(
                                      address.chain.toLowerCase() + ',',
                                    ) ||
                                  address.path
                                    .toLowerCase()
                                    .includes(address.chain.toLowerCase() + '-')
                                    ? address.path
                                    : address.chain}
                                </span>
                                <span className="ml-1 text-gray-400">
                                  ({shortenHex(address.derived_address)})
                                </span>
                              </div>
                              <span
                                className={`ml-4 text-gray-400 ${
                                  hoveredIndex === index
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                }`}
                              >
                                <FaExternalLinkAlt className="text-nearblue-600 dark:text-neargray-10" />{' '}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </PerfectScrollbar>
                </div>
              </PopoverContent>
            </PopoverRoot>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MultichainInfoActions;
