import {
  dollarFormat,
  localFormat,
  weight,
  convertToUTC,
  yoctoToNear,
  fiatValue,
  nanoToMilli,
  shortenAddress,
} from '@/utils/libs';

import WarningIcon from '../Icons/WarningIcon';
import FaExternalLinkAlt from '../Icons/FaExternalLinkAlt';
import TokenHoldings from '../common/TokenHoldings';
import Link from 'next/link';
import { getConfig, networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Skeleton from '../skeleton/common/Skeleton';
import { useRouter } from 'next/router';
import TokenImage from '../common/TokenImage';

const Balance = ({
  accountData,
  statsData,
  accountView,
  isAccountLoading,
  isLocked,
  contract,
  isContractLoading,
  tokenData,
  loading,
  inventoryData,
  spamTokens,
  isloading,
  inventoryLoading,
  ft,
  deploymentData,
  nftTokenData,
}: any) => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation();
  const config = getConfig && getConfig(networkId);

  const balance = accountData?.amount ?? '';
  const nearPrice = statsData?.near_price ?? '';

  return (
    <>
      {accountView !== null &&
        accountView?.block_hash === undefined &&
        accountData?.deleted?.transaction_hash &&
        !isAccountLoading && (
          <>
            <div className="block lg:flex lg:space-x-2">
              <div className="w-full ">
                <div className="h-full w-full inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-600 rounded-lg p-4 text-sm dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60">
                  <p className="mb-0 items-center break-worAds">
                    <WarningIcon className="w-5 h-5 fill-current mx-1 inline-block text-red-600" />
                    {`This account was deleted on ${
                      accountData?.deleted?.transaction_hash
                        ? convertToUTC(
                            nanoToMilli(accountData.deleted.block_timestamp),
                            false,
                          )
                        : ''
                    }`}
                  </p>
                </div>
              </div>
            </div>
            <div className="py-2"></div>
          </>
        )}
      {accountView !== null &&
        accountView?.block_hash !== undefined &&
        isLocked &&
        accountData &&
        accountData?.deleted?.transaction_hash === null &&
        contract === null &&
        !isContractLoading && (
          <>
            <div className="block lg:flex lg:space-x-2">
              <div className="w-full ">
                <div className="h-full w-full inline-block border border-yellow-600 border-opacity-25 bg-opacity-10 bg-yellow-300 text-yellow-600 rounded-lg p-4 text-sm dark:bg-yellow-400/[0.10] dark:text-nearyellow-400 dark:border dark:border-yellow-400/60">
                  <p className="mb-0 items-center">
                    <WarningIcon className="w-5 h-5 fill-current mx-1 inline-block text-red-600" />
                    This account has no full access keys
                  </p>
                </div>
              </div>
            </div>
            <div className="py-2"></div>
          </>
        )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="w-full">
          <div className="h-full bg-white soft-shadow rounded-xl dark:bg-black-600">
            <div className="flex justify-between border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10">
              <h2 className="leading-6 text-sm font-semibold">
                {t ? t('address:overview') : 'Overview'}
              </h2>
              {tokenData?.name && (
                <div className="flex items-center text-xs bg-gray-100 dark:bg-black-200 dark:text-neargray-10 rounded-md px-2 py-1">
                  <div className="truncate max-w-[110px]">
                    {tokenData?.name}
                  </div>
                  {tokenData?.website && (
                    <a
                      href={tokenData?.website}
                      className="ml-1"
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      <FaExternalLinkAlt />
                    </a>
                  )}
                </div>
              )}
            </div>
            <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
              <div className="flex flex-wrap py-4">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  {t ? t('address:balance') : 'Balance'}:
                </div>
                {loading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <div className="w-full md:w-3/4 break-words">
                    {balance
                      ? yoctoToNear(accountData?.amount, true) + ' Ⓝ'
                      : ''}
                  </div>
                )}
              </div>
              {networkId === 'mainnet' &&
                accountData?.amount &&
                statsData?.near_price && (
                  <div className="flex flex-wrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
                    <div className="w-full md:w-1/4 mb-2 md:mb-0">
                      {t ? t('address:value') : 'Value:'}
                    </div>
                    {loading ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      <div className="w-full md:w-3/4 break-words flex items-center">
                        <span className="px-1">
                          {accountData?.amount && statsData?.near_price
                            ? '$' +
                              fiatValue(
                                yoctoToNear(accountData?.amount, false),
                                statsData?.near_price,
                              ) +
                              ' '
                            : ''}
                        </span>
                        <span className="text-xs">
                          (@{' '}
                          {nearPrice
                            ? '$' + dollarFormat(statsData?.near_price)
                            : ''}{' '}
                          / Ⓝ)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              <div className="flex flex-wrap py-4 text-sm text-nearblue-600 dark:text-neargray-10">
                <div className="w-full md:w-1/4 mb-2 md:mb-0">
                  {t ? t('address:tokens') : 'Tokens:'}
                </div>
                <div className="w-full md:w-3/4 break-words -my-1 z-10">
                  <TokenHoldings
                    data={inventoryData}
                    loading={isloading}
                    inventoryLoading={inventoryLoading}
                    ft={ft}
                    id={id as string}
                    spamTokens={spamTokens.blacklist}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full">
          <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
            <h2 className="leading-6 border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
              {t ? t('address:moreInfo') : 'Account information'}
            </h2>
            <div className="px-3 divide-y dark:divide-black-200 text-sm text-nearblue-600 dark:text-neargray-10">
              <div className="flex justify-between">
                <div className="flex xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                  <div className="w-full mb-2 md:mb-0">
                    Staked {t ? t('address:balance') : 'Balance'}:
                  </div>
                  {loading ? (
                    <div className="w-full break-words">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <div className="w-full break-words xl:mt-0 mt-2">
                      {accountData?.locked
                        ? yoctoToNear(accountData?.locked, true) + ' Ⓝ'
                        : accountData?.locked ?? ''}
                    </div>
                  )}
                </div>
                <div className="flex ml-4  xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                  <div className="w-full mb-2 md:mb-0">
                    {t ? t('address:storageUsed') : 'Storage Used'}:
                  </div>
                  {loading ? (
                    <div className="w-full break-words">
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ) : (
                    <div className="w-full break-words xl:mt-0 mt-2">
                      {accountData?.storage_usage
                        ? weight(accountData?.storage_usage)
                        : accountData?.storage_usage ?? ''}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                  {loading ? (
                    <div className="w-full mb-2 md:mb-0">
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ) : (
                    <div className="w-full mb-2 md:mb-0">
                      {accountView !== null &&
                      accountView?.block_hash === undefined &&
                      accountData?.deleted?.transaction_hash &&
                      !isAccountLoading
                        ? 'Deleted At:'
                        : 'Created At:'}
                    </div>
                  )}
                  {loading ? (
                    <div className="w-full break-words">
                      <Skeleton className="h-4 w-40" />
                    </div>
                  ) : (
                    <div className="w-full break-words xl:mt-0 mt-2">
                      {accountView !== null &&
                      accountView?.block_hash === undefined &&
                      accountData?.deleted?.transaction_hash &&
                      !isAccountLoading
                        ? convertToUTC(
                            nanoToMilli(accountData.deleted.block_timestamp),
                            false,
                          )
                        : accountData?.created?.transaction_hash
                        ? convertToUTC(
                            nanoToMilli(accountData.created.block_timestamp),
                            false,
                          )
                        : accountData?.code_hash
                        ? 'Genesis'
                        : 'N/A'}
                    </div>
                  )}
                </div>
                {contract && contract?.hash && !loading ? (
                  <div className="flex ml-4 xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                    <div className="w-full mb-2 md:mb-0">Contract Locked:</div>
                    <div className="w-full break-words xl:mt-0 mt-2">
                      {contract?.code_base64 && isLocked ? 'Yes' : 'No'}
                    </div>
                  </div>
                ) : (
                  <div className="flex ml-4 xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full" />
                )}
              </div>
              {deploymentData?.receipt_predecessor_account_id && (
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    Contract Creator:
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    <Link
                      href={`/address/${deploymentData.receipt_predecessor_account_id}`}
                      className="text-green-500 dark:text-green-250 hover:no-underline"
                    >
                      {shortenAddress(
                        deploymentData.receipt_predecessor_account_id ?? '',
                      )}
                    </Link>
                    {' at txn  '}
                    <Link
                      href={`/txns/${deploymentData.transaction_hash}`}
                      className="text-green-500 dark:text-green-250 hover:no-underline"
                    >
                      {shortenAddress(deploymentData.transaction_hash ?? '')}
                    </Link>
                  </div>
                </div>
              )}
              {tokenData?.name && (
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    Token Tracker:
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    <div className="flex items-center">
                      <TokenImage
                        src={tokenData?.icon}
                        alt={tokenData?.name}
                        className="w-4 h-4 mr-2"
                      />
                      <Link
                        href={`/token/${id}`}
                        className="flex text-green-500 dark:text-green-250 hover:no-underline"
                      >
                        <span className="inline-block truncate max-w-[110px] mr-1">
                          {tokenData.name}
                        </span>
                        (
                        <span className="inline-block truncate max-w-[80px]">
                          {tokenData.symbol}
                        </span>
                        )
                      </Link>
                      {tokenData.price && (
                        <div className="text-nearblue-600 dark:text-neargray-10 ml-1">
                          (@ ${localFormat(tokenData.price)})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {nftTokenData?.name && (
                <div className="flex flex-wrap items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">
                    NFT Token Tracker:
                  </div>
                  <div className="w-full md:w-3/4 break-words">
                    <div className="flex items-center">
                      <TokenImage
                        src={nftTokenData?.icon}
                        alt={nftTokenData?.name}
                        className="w-4 h-4 mr-2"
                      />
                      <Link
                        href={`/nft-token/${id}`}
                        className="flex text-green-500 dark:text-green-250 hover:no-underline"
                      >
                        <span className="inline-block truncate max-w-[110px] mr-1">
                          {nftTokenData.name}
                        </span>
                        (
                        <span className="inline-block truncate max-w-[80px]">
                          {nftTokenData.symbol}
                        </span>
                        )
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Balance;
