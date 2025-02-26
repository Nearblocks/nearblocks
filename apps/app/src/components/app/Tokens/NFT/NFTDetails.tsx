'use client';
import { useState } from 'react';

import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from '@/components/ui/accordion';
import { useFetch } from '@/hooks/app/useFetch';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/libs';
import { SpamToken, Token, TransactionInfo } from '@/utils/types';

import TokenImage, { NFTImage } from '../../common/TokenImage';
import Tooltip from '../../common/Tooltip';
import Question from '../../Icons/Question';
import WarningIcon from '../../Icons/WarningIcon';
import TokenTransfers from './TokenTransfers';
import { convertTimestampToTimes } from '@/utils/app/libs';
interface Props {
  error: boolean;
  id: string;
  tid?: string;
  tokenInfo: { tokens: Token[] };
  txnsCount: {
    txns: { count: string }[];
  };
  txnsList: {
    cursor: string;
    txns: TransactionInfo[];
  };
}
const NFTDetails = ({
  error,
  id,
  tid,
  tokenInfo,
  txnsCount,
  txnsList,
}: Props) => {
  const [indices, setIndices] = useState<number[]>([1, 2]);
  const [isVisible, setIsVisible] = useState(true);
  const [utc, setUtc] = useState(true);
  const token: Token = tokenInfo?.tokens?.[0];
  const { data: spamList } = useFetch(
    'https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json',
  );
  const spamTokens: SpamToken = spamList;

  const toggleItem = (index: number) => {
    if (indices.includes(index)) {
      setIndices(indices.filter((currentIndex) => currentIndex !== index));
    } else {
      setIndices([...indices, index].sort());
    }
  };

  function isTokenSpam(tokenName: string) {
    if (spamTokens)
      for (const spamToken of spamTokens.blacklist) {
        const cleanedToken = spamToken.replace(/^\*/, '');
        if (tokenName.endsWith(cleanedToken)) {
          return true;
        }
      }
    return false;
  }
  const handleClose = () => {
    setIsVisible(false);
  };
  const firstObject = txnsList?.txns?.[0] || null;
  const isBurned =
    firstObject?.cause === 'BURN'
      ? { timestamp: firstObject?.block_timestamp }
      : null;

  const { utcTime, localTime } = convertTimestampToTimes(
    isBurned?.timestamp ?? '',
  );

  return (
    <div className="container-xxl mx-auto px-5">
      {isTokenSpam(token?.contract || id) && isVisible && (
        <>
          <div className="w-full mt-6 flex justify-between text-left border dark:bg-nearred-500  dark:border-nearred-400 dark:text-nearred-300 bg-red-50 border-red-100 text-red-500 text-sm rounded-lg p-4">
            <p className="items-center">
              <WarningIcon className="w-5 h-5 fill-current mx-1 inline-flex" />
              This token is reported to have been spammed to many users. Please
              exercise caution when interacting with it. Click
              <a
                className="underline mx-0.5"
                href="https://github.com/Nearblocks/spam-token-list"
                target="_blank"
              >
                here
              </a>
              for more info.
            </p>
            <span
              className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-400 cursor-pointer"
              onClick={handleClose}
            >
              X
            </span>
          </div>
        </>
      )}
      {isBurned && (
        <div className="w-full flex justify-between mt-6 border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-600 rounded-lg p-4 text-sm dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60">
          <p className="mb-0 items-center break-words">
            <WarningIcon className="w-5 h-5 fill-current mx-1 inline-block text-red-600" />
            This NFT was burned on
            <span className="ml-0.5">
              <Tooltip
                className={'left-1/2 mb-3 whitespace-nowrap max-w-[200px]'}
                position="top"
                tooltip={utc ? 'Switch to local time' : 'Switch to UTC'}
              >
                <button onClick={() => setUtc((prevState) => !prevState)}>
                  {`(${utc ? utcTime : localTime})`}
                </button>
              </Tooltip>
            </span>
          </p>
        </div>
      )}
      <div className="grid md:grid-cols-12 pt-4 mb-2">
        <div className="md:col-span-5 lg:col-span-4 pt-4">
          <div className="bg-white dark:bg-black-600 dark:border-black-200 border rounded-xl soft-shadow p-3 aspect-square">
            <NFTImage
              base={token?.nft?.base_uri}
              className={'rounded max-h-full'}
              media={token?.media}
              reference={token?.reference}
            />
          </div>
        </div>
        <div className="md:col-span-7 lg:col-span-8 md:px-4 lg:pl-8 pt-4">
          <h1 className="break-all space-x-2 text-xl text-gray-700 dark:text-neargray-10 leading-8 font-semibold">
            {token?.title || token?.token}
          </h1>
          <Link
            className="break-all text-green dark:text-green-250 leading-6 text-sm hover:no-underline font-semibold"
            href={`/nft-token/${id}`}
          >
            <span className="inline-flex align-middle h-5 w-5 mr-2.5">
              <TokenImage
                alt={token?.nft?.name}
                className="w-5 h-5"
                src={token?.nft?.icon}
              />
            </span>
            <span>{token?.nft?.name}</span>
          </Link>
          <AccordionRoot
            className="bg-white dark:bg-black-600 dark:border-black-200 border rounded-xl  soft-shadow mt-4"
            collapsible
            defaultValue={indices.map((num) => num.toString())}
            multiple
          >
            <AccordionItem key={1} value="1">
              <AccordionItemTrigger
                buttonColor={'text-gray-600 dark:text-neargray-10'}
                className="w-full flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-neargray-10 border-b dark:border-black-200 focus:outline-none p-3"
                onChange={() => toggleItem(1)}
              >
                <h2>Details</h2>
              </AccordionItemTrigger>
              <AccordionItemContent className="text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="divide-solid divide-gray-200 dark:divide-black-200 divide-y">
                  {token?.asset && (
                    <div className="flex p-4">
                      <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                        <Tooltip
                          className={'left-[5.5rem] w-40 max-w-[300px]'}
                          position="bottom"
                          tooltip="Current owner of this NFT"
                        >
                          <div>
                            <Question className="w-4 h-4 fill-current mr-1" />
                          </div>
                        </Tooltip>
                        Owner:
                      </div>
                      <div className="w-full xl:w-3/4 word-break">
                        <Link
                          className="text-green dark:text-green-250 hover:no-underline font-medium"
                          href={`/address/${token?.asset?.owner}`}
                        >
                          {shortenAddress &&
                            shortenAddress(token?.asset?.owner ?? '')}
                        </Link>
                      </div>
                    </div>
                  )}
                  <div className="flex p-4">
                    <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                      <Tooltip
                        className={'left-24 w-44 max-w-[300px]'}
                        position="bottom"
                        tooltip="Address of this NFT contract"
                      >
                        <div>
                          <Question className="w-4 h-4 fill-current mr-1" />
                        </div>
                      </Tooltip>
                      Contract Address:
                    </div>
                    <div className="w-full xl:w-3/4 word-break">
                      <Link
                        className="text-green  dark:text-green-250 hover:no-underline font-medium"
                        href={`/address/${id}`}
                      >
                        {shortenAddress && shortenAddress(id ?? '')}
                      </Link>
                    </div>
                  </div>
                  <div className="flex p-4">
                    <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                      <Tooltip
                        className={'left-[5.5rem] w-40 max-w-[300px]'}
                        position="bottom"
                        tooltip="This NFT's unique token ID"
                      >
                        <div>
                          <Question className="w-4 h-4 fill-current mr-1" />
                        </div>
                      </Tooltip>
                      Token ID:
                    </div>
                    <div className="w-full xl:w-3/4 word-break">{tid}</div>
                  </div>
                  <div className="flex p-4">
                    <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                      <Tooltip
                        className={'left-[5.5rem] w-40 max-w-[300px]'}
                        position="bottom"
                        tooltip="The standard followed by this NFT"
                      >
                        <div>
                          <Question className="w-4 h-4 fill-current mr-1" />
                        </div>
                      </Tooltip>
                      Token Standard:
                    </div>
                    <div className="w-full xl:w-3/4 word-break">NEP-171</div>
                  </div>
                </div>
              </AccordionItemContent>
            </AccordionItem>
            {token?.description && (
              <AccordionItem key={2} value="2">
                <AccordionItemTrigger
                  buttonColor={'text-gray-600 dark:text-neargray-10'}
                  className="w-full flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-neargray-10 border-b dark:border-black-200 focus:outline-none p-3"
                  onClick={() => toggleItem(2)}
                >
                  <h2>Description</h2>
                </AccordionItemTrigger>
                <AccordionItemContent className="text-sm text-nearblue-600 dark:text-neargray-10 border-b dark:border-black-200 p-3">
                  {token.description}
                </AccordionItemContent>
              </AccordionItem>
            )}
          </AccordionRoot>
        </div>
      </div>
      <div className="py-6"></div>
      <div className="block lg:flex lg:space-x-2 mb-10">
        <div className="w-full ">
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
            <TokenTransfers
              data={txnsList}
              error={error}
              txnsCount={txnsCount}
            />
          </div>
        </div>
      </div>
      {/* <div className="mb-10">
        <Banner type="center" />
      </div> */}
    </div>
  );
};
export default NFTDetails;
