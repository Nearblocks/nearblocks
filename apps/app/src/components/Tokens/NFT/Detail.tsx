import { shortenAddress } from '@/utils/libs';
import { SpamToken, Token, TransactionInfo } from '@/utils/types';
import { useState } from 'react';
import Link from 'next/link';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@reach/accordion';
import { useFetch } from '@/hooks/useFetch';
import { Tooltip } from '@reach/tooltip';
import TokenImage, { NFTImage } from '@/components/common/TokenImage';
import WarningIcon from '@/components/Icons/WarningIcon';
import ArrowUp from '@/components/Icons/ArrowUp';
import ArrowDown from '@/components/Icons/ArrowDown';
import Question from '@/components/Icons/Question';
import TokenTransfers from './TokenTransfers';
interface Props {
  id: string;
  tid?: string;
  tokenInfo: { tokens: Token[] };
  txnsList: {
    txns: TransactionInfo[];
    cursor: string;
  };
  txnsCount: {
    txns: { count: string }[];
  };
  error: boolean;
}
const Detail = ({ id, tid, tokenInfo, txnsList, txnsCount, error }: Props) => {
  const [indices, setIndices] = useState<number[]>([1, 2]);
  const [isVisible, setIsVisible] = useState(true);
  const { data: spamList } = useFetch(
    'https://raw.githubusercontent.com/Nearblocks/spam-token-list/main/tokens.json',
  );
  const token: Token = tokenInfo?.tokens?.[0];
  const spamTokensString = spamList && spamList.replace(/,\s*([}\]])/g, '$1');
  const spamTokens: SpamToken =
    spamTokensString && JSON.parse(spamTokensString);

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
                href="https://github.com/Nearblocks/spam-token-list"
                className="underline mx-0.5"
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
              media={token?.media}
              reference={token?.reference}
              className={'rounded max-h-full'}
            />
          </div>
        </div>
        <div className="md:col-span-7 lg:col-span-8 md:px-4 lg:pl-8 pt-4">
          <h1 className="break-all space-x-2 text-xl text-gray-700 dark:text-neargray-10 leading-8 font-semibold">
            {token?.title || token?.token}
          </h1>
          <Link
            href={`/nft-token/${id}`}
            className="break-all text-green dark:text-green-250 leading-6 text-sm hover:no-underline"
          >
            <span className="inline-flex align-middle h-5 w-5 mr-2.5">
              <TokenImage
                src={token?.nft?.icon}
                alt={token?.nft?.name}
                className="w-5 h-5"
              />
            </span>
            <span>{token?.nft?.name}</span>
          </Link>
          <Accordion
            multiple
            className="bg-white dark:bg-black-600 dark:border-black-200 border rounded-xl  soft-shadow mt-4"
            defaultIndex={indices}
            collapsible
          >
            <AccordionItem index={1}>
              <AccordionButton
                onChange={() => toggleItem(1)}
                className="w-full flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-neargray-10 border-b dark:border-black-200 focus:outline-none p-3"
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
                          label="Current owner of this NFT"
                          className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                        >
                          <div>
                            <Question className="w-4 h-4 fill-current mr-1" />
                          </div>
                        </Tooltip>
                        Owner:
                      </div>
                      <div className="w-full xl:w-3/4 word-break">
                        <Link
                          href={`/address/${token?.asset?.owner}`}
                          className="text-green dark:text-green-250 hover:no-underline"
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
                        label="Address of this NFT contract"
                        className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                      >
                        <div>
                          <Question className="w-4 h-4 fill-current mr-1" />
                        </div>
                      </Tooltip>
                      Contract Address:
                    </div>
                    <div className="w-full xl:w-3/4 word-break">
                      <Link
                        href={`/address/${id}`}
                        className="text-green  dark:text-green-250 hover:no-underline"
                      >
                        {shortenAddress && shortenAddress(id ?? '')}
                      </Link>
                    </div>
                  </div>
                  <div className="flex p-4">
                    <div className="flex items-center w-full xl:w-1/4 mb-2 xl:mb-0">
                      <Tooltip
                        label="This NFT's unique token ID"
                        className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
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
                        label="The standard followed by this NFT"
                        className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
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
                  onClick={() => toggleItem(2)}
                  className="w-full flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-neargray-10 border-b dark:border-black-200 focus:outline-none p-3"
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
              txnsCount={txnsCount}
              error={error}
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
