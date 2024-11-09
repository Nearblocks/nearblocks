import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@reach/accordion';
import { Tooltip } from '@reach/tooltip';
import { useState } from 'react';

import TokenImage, { NFTImage } from '@/components/common/TokenImage';
import ArrowDown from '@/components/Icons/ArrowDown';
import ArrowUp from '@/components/Icons/ArrowUp';
import Question from '@/components/Icons/Question';
import WarningIcon from '@/components/Icons/WarningIcon';
import { useFetch } from '@/hooks/useFetch';
import { Link } from '@/i18n/routing';
import { shortenAddress } from '@/utils/libs';
import { SpamToken, Token, TransactionInfo } from '@/utils/types';

import TokenTransfers from './TokenTransfers';
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
const Detail = ({ error, id, tid, tokenInfo, txnsCount, txnsList }: Props) => {
  const [indices, setIndices] = useState<number[]>([1, 2]);
  const [isVisible, setIsVisible] = useState(true);
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
      for (const spamToken of spamTokens?.blacklist) {
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
  return (
    <div className="container mx-auto px-3">
      {isTokenSpam(token?.contract || id) && isVisible && (
        <>
          <div className="py-2"></div>
          <div className="w-full flex justify-between text-left border dark:bg-nearred-500  dark:border-nearred-400 dark:text-nearred-300 bg-red-50 border-red-100 text-red-500 text-sm rounded-lg p-4">
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
            className="break-all text-green dark:text-green-250 leading-6 text-sm hover:no-underline"
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
          <Accordion
            className="bg-white dark:bg-black-600 dark:border-black-200 border rounded-xl  soft-shadow mt-4"
            collapsible
            defaultIndex={indices}
            multiple
          >
            <AccordionItem index={1}>
              <AccordionButton
                className="w-full flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-neargray-10 border-b dark:border-black-200 focus:outline-none p-3"
                onChange={() => toggleItem(1)}
              >
                <h2>Details</h2>
                {indices?.includes(1) ? (
                  <ArrowUp className="fill-current" />
                ) : (
                  <ArrowDown className="fill-current" />
                )}
              </AccordionButton>
              <AccordionPanel className="text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="divide-solid divide-gray-200 dark:divide-black-200 divide-y">
                  {token?.asset && (
                    <div className="flex p-4">
                      <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                        <Tooltip
                          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                          label="Current owner of this NFT"
                        >
                          <div>
                            <Question className="w-4 h-4 fill-current mr-1" />
                          </div>
                        </Tooltip>
                        Owner:
                      </div>
                      <div className="w-full xl:w-3/4 word-break">
                        <Link
                          className="text-green dark:text-green-250 hover:no-underline"
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
                        className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                        label="Address of this NFT contract"
                      >
                        <div>
                          <Question className="w-4 h-4 fill-current mr-1" />
                        </div>
                      </Tooltip>
                      Contract Address:
                    </div>
                    <div className="w-full xl:w-3/4 word-break">
                      <Link
                        className="text-green  dark:text-green-250 hover:no-underline"
                        href={`/address/${id}`}
                      >
                        {shortenAddress && shortenAddress(id ?? '')}
                      </Link>
                    </div>
                  </div>
                  <div className="flex p-4">
                    <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                      <Tooltip
                        className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                        label="This NFT's unique token ID"
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
                        className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                        label="The standard followed by this NFT"
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
              </AccordionPanel>
            </AccordionItem>
            {token?.description && (
              <AccordionItem index={2}>
                <AccordionButton
                  className="w-full flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-neargray-10 border-b dark:border-black-200 focus:outline-none p-3"
                  onClick={() => toggleItem(2)}
                >
                  <h2>Description</h2>
                  {indices.includes(2) ? (
                    <ArrowUp className="fill-current" />
                  ) : (
                    <ArrowDown className="fill-current" />
                  )}
                </AccordionButton>
                <AccordionPanel className="text-sm text-nearblue-600 dark:text-neargray-10 border-b dark:border-black-200 p-3">
                  {token.description}
                </AccordionPanel>
              </AccordionItem>
            )}
          </Accordion>
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
export default Detail;
