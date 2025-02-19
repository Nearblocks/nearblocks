import {
  dollarFormat,
  localFormat,
  weight,
  convertToUTC,
  yoctoToNear,
  fiatValue,
  nanoToMilli,
  shortenAddress,
  shortenHex,
} from '@/utils/libs';
import 'react-perfect-scrollbar/dist/css/styles.css';
import PerfectScrollbar from 'react-perfect-scrollbar';
import WarningIcon from '../Icons/WarningIcon';
import FaExternalLinkAlt from '../Icons/FaExternalLinkAlt';
import TokenHoldings from '../common/TokenHoldings';
import Link from 'next/link';
import { chainAbstractionExplorerUrl, networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
import Skeleton from '../skeleton/common/Skeleton';
import { useRouter } from 'next/router';
import TokenImage from '../common/TokenImage';
import ArrowDown from '../Icons/ArrowDown';
import { Menu, MenuButton, MenuItems, MenuPopover } from '@reach/menu-button';
import { useRef, useState } from 'react';
import Bitcoin from '../Icons/Networks/Bitcoin';
import Ethereum from '../Icons/Networks/Ethereum';

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
  multiChainAccounts,
  accessKeys,
  status,
}: any) => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation();
  const balance = status
    ? accountData?.deleted?.transaction_hash
      ? null
      : accountData?.amount
    : accountView?.amount;
  const stakedBalace = status ? accountData?.locked : accountView?.locked;
  const storageUsed = status
    ? accountData?.storage_usage
    : accountView?.storage_usage;
  const nearPrice = statsData?.near_price ?? '';

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [positionClass, setPositionClass] = useState('left-0');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleChainSelect = (chain: string, address: string) => {
    const url =
      chain in chainAbstractionExplorerUrl
        ? chainAbstractionExplorerUrl[
            chain as keyof typeof chainAbstractionExplorerUrl
          ]?.address(address)
        : '';

    url ? window.open(url, '_blank') : '';
  };

  const handleMenuOpen = () => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 300;
      const availableSpaceRight = window.innerWidth - buttonRect.right;

      if (availableSpaceRight < menuWidth) {
        setPositionClass('right-0');
      } else {
        setPositionClass('left-0');
      }
    }
  };

  return (
    <>
      {accountView === null &&
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
        isLocked &&
        accountData &&
        accountData?.deleted?.transaction_hash === null &&
        contract === null &&
        accessKeys?.length > 0 &&
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                    {balance ? yoctoToNear(balance, true) + ' Ⓝ' : ''}
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
                        <span>
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
                    spamTokens={spamTokens?.blacklist}
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
                <div className="flex xl:!flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                  <div className="w-full mb-2 md:mb-0">
                    Staked {t ? t('address:balance') : 'Balance'}:
                  </div>
                  {loading ? (
                    <div className="w-full break-words">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ) : (
                    <div className="w-full break-words xl:mt-0 mt-2">
                      {stakedBalace
                        ? yoctoToNear(stakedBalace, true) + ' Ⓝ'
                        : stakedBalace ?? ''}
                    </div>
                  )}
                </div>
                <div className="flex ml-4 xl:flex-nowrap flex-wrap items-center justify-between py-4 w-full">
                  <div className="w-full mb-2 md:mb-0">
                    {t ? t('address:storageUsed') : 'Storage Used'}:
                  </div>
                  {loading ? (
                    <div className="w-full break-words">
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ) : (
                    <div className="w-full break-words xl:mt-0 mt-2">
                      {storageUsed ? weight(storageUsed) : storageUsed ?? ''}
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
                            nanoToMilli(accountData?.deleted?.block_timestamp),
                            false,
                          )
                        : accountData?.created?.transaction_hash
                        ? convertToUTC(
                            nanoToMilli(accountData?.created?.block_timestamp),
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
                      href={`/address/${deploymentData?.receipt_predecessor_account_id}`}
                      className="text-green-500 dark:text-green-250 hover:no-underline"
                    >
                      {shortenAddress(
                        deploymentData?.receipt_predecessor_account_id ?? '',
                      )}
                    </Link>
                    {' at txn  '}
                    <Link
                      href={`/txns/${deploymentData?.transaction_hash}`}
                      className="text-green-500 dark:text-green-250 hover:no-underline"
                    >
                      {shortenAddress(deploymentData?.transaction_hash ?? '')}
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
                          {tokenData?.name}
                        </span>
                        (
                        <span className="inline-block truncate max-w-[80px]">
                          {tokenData?.symbol}
                        </span>
                        )
                      </Link>
                      {tokenData?.price && (
                        <div className="text-nearblue-600 dark:text-neargray-10 ml-1">
                          (@ ${localFormat(tokenData?.price)})
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
                          {nftTokenData?.name}
                        </span>
                        (
                        <span className="inline-block truncate max-w-[80px]">
                          {nftTokenData?.symbol}
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

        <div className="w-full">
          <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl">
            <h2 className="leading-6 border-b dark:border-black-200 p-3 text-nearblue-600 dark:text-neargray-10 text-sm font-semibold">
              Multichain Information
            </h2>
            <div className="px-3 py-4 text-sm text-nearblue-600 dark:text-neargray-10 flex flex-wrap items-center">
              {loading ? (
                <div className="w-full break-words">
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : true ? (
                <div className="flex w-full flex-wrap items-center gap-2 md:gap-4">
                  <span className="flex-shrink-0">
                    {multiChainAccounts?.length
                      ? multiChainAccounts?.length
                      : 'No'}{' '}
                    {multiChainAccounts?.length === 1 ? 'address' : 'addresses'}{' '}
                    found on:
                  </span>
                  <div className="relative flex-1 group">
                    <Menu>
                      <MenuButton
                        ref={buttonRef}
                        className={`min-w-[8rem] h-8 text-sm px-2 rounded border dark:border-black-200 outline-none flex items-center justify-between ${
                          multiChainAccounts?.length
                            ? 'cursor-pointer'
                            : 'cursor-not-allowed'
                        }`}
                        disabled={!multiChainAccounts?.length}
                        onClick={handleMenuOpen}
                      >
                        <span>{'Foreign Chain'}</span>
                        <ArrowDown className="w-4 h-4 ml-2 fill-current text-gray-500 pointer-events-none" />
                      </MenuButton>
                      <MenuPopover portal={false} className="relative ">
                        <MenuItems
                          className={`absolute min-w-fit ${positionClass} bg-white rounded-lg shadow border z-50 dark:border-black-200 dark:bg-black p-2`}
                        >
                          <div className="dark:bg-black">
                            <PerfectScrollbar>
                              <div className="max-h-60 dark:bg-black">
                                {multiChainAccounts?.map(
                                  (address: any, index: any) => (
                                    <div
                                      key={index}
                                      className="pb-2 dark:bg-black flex justify-between items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-black-200 truncate cursor-pointer rounded-lg"
                                      onClick={() =>
                                        handleChainSelect(
                                          address.chain.toLowerCase(),
                                          address.derived_address,
                                        )
                                      }
                                      onMouseEnter={() =>
                                        setHoveredIndex(index)
                                      }
                                      onMouseLeave={() => setHoveredIndex(null)}
                                    >
                                      {address.chain && (
                                        <div className="flex items-center justify-between w-full ">
                                          <div className="flex items-center">
                                            {address.chain === 'BITCOIN' && (
                                              <Bitcoin className="w-4 h-4 text-orange-400" />
                                            )}
                                            {address.chain === 'ETHEREUM' && (
                                              <Ethereum className="w-4 h-4 text-black-200 dark:text-neargray-10" />
                                            )}
                                            <span className="ml-2">
                                              {address.path
                                                .toLowerCase()
                                                .includes(
                                                  address.chain.toLowerCase() +
                                                    ',',
                                                ) ||
                                              address.path
                                                .toLowerCase()
                                                .includes(
                                                  address.chain.toLowerCase() +
                                                    '-',
                                                )
                                                ? address.path
                                                : address.chain}
                                            </span>
                                            <span className="ml-1 text-gray-400">
                                              (
                                              {shortenHex(
                                                address.derived_address,
                                              )}
                                              )
                                            </span>
                                          </div>
                                          <span
                                            className={`ml-4 text-gray-400 ${
                                              hoveredIndex === index
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                            }`}
                                          >
                                            <FaExternalLinkAlt />
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ),
                                )}
                              </div>
                            </PerfectScrollbar>
                          </div>
                        </MenuItems>
                      </MenuPopover>
                    </Menu>
                  </div>
                </div>
              ) : (
                'N/A'
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Balance;
