'use client';
import { Link } from '@/i18n/routing';
import { localFormat } from '@/utils/libs';
import { Token } from '@/utils/types';

import ErrorMessage from '../../common/ErrorMessage';
import Paginator from '../../common/Paginator';
import { NFTImage } from '../../common/TokenImage';
import FaInbox from '../../Icons/FaInbox';
import Skeleton from '../../skeleton/common/Skeleton';

interface Props {
  count: number;
  error: boolean;
  tab: string;
  token: Token;
  tokens: Token[];
}

const NFTInventory = ({ count, error, tab, token, tokens }: Props) => {
  return (
    <>
      {tab === 'inventory' ? (
        <>
          {!tokens ? (
            <div className="pl-6 max-w-lg w-full py-5 ">
              <Skeleton className="h-4" />
            </div>
          ) : (
            <div
              className={`flex flex-col lg:flex-row pt-4 border-b dark:border-black-200`}
            >
              <div className="flex flex-col">
                <p className="leading-7 px-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
                  {tokens.length > 0 &&
                    `A total of ${
                      localFormat && localFormat(count.toString())
                    }${' '}
              tokens found`}
                </p>
              </div>
            </div>
          )}
          {error && tokens.length === 0 && (
            <div className="px-6 py-4 text-gray-400 text-xs">
              <ErrorMessage
                icons={<FaInbox />}
                message="There are no matching entries"
                mutedText="Please try again later"
              />
            </div>
          )}
          <div className="flex flex-wrap sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 m-6">
            {!tokens &&
              [...Array(24)].map((_, i) => (
                <div
                  className="max-w-full border rounded p-3 mx-auto md:mx-0"
                  key={i}
                >
                  <a
                    className="flex items-center justify-center m-auto overflow-hidden"
                    href="#"
                  >
                    <div className="w-40 h-40 ">
                      <Skeleton className="h-40" />
                    </div>
                  </a>
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden text-xs mb-1 text-nearblue-600 dark:text-neargray-10 mt-4">
                    <Skeleton className="h-4" />
                  </div>
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden text-xs mb-1 text-nearblue-600 dark:text-neargray-10">
                    <Skeleton className="h-4" />
                  </div>
                </div>
              ))}
            {!error &&
              tokens &&
              tokens?.map((nft: Token) => (
                <div
                  className="max-w-full border dark:border-black-200 rounded p-3 mx-auto md:mx-0"
                  key={nft?.contract + nft?.token}
                >
                  <Link
                    className="w-40 h-40 flex items-center justify-center m-auto overflow-hidden hover:no-underline"
                    href={`/nft-token/${nft?.contract}/${nft?.token}`}
                  >
                    <NFTImage
                      base={token.base_uri}
                      className="rounded max-h-full"
                      media={nft.media}
                      reference={nft.reference}
                    />
                  </Link>
                  <div className="whitespace-nowrap text-ellipsis overflow-hidden text-xs mb-1 text-nearblue-600 dark:text-neargray-10 mt-4">
                    Token ID:{' '}
                    <Link
                      className="text-green dark:text-green-250 hover:no-underline"
                      href={`/nft-token/${nft?.contract}/${nft?.token}`}
                    >
                      {nft?.token}
                    </Link>
                  </div>
                  {nft?.asset && (
                    <div className="whitespace-nowrap text-ellipsis overflow-hidden text-xs mb-1 text-nearblue-600 dark:text-neargray-10">
                      Owner:{' '}
                      <Link
                        className="text-green dark:text-green-250 hover:no-underline"
                        href={`/address/${nft?.asset?.owner}`}
                      >
                        {nft?.asset?.owner}
                      </Link>
                    </div>
                  )}
                </div>
              ))}
          </div>
          {!error && <Paginator count={count} limit={24} pageLimit={200} />}
        </>
      ) : (
        <div className="w-full h-[500px]"></div>
      )}
    </>
  );
};
export default NFTInventory;
