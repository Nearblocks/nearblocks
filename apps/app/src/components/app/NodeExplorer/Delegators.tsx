'use client';
import { formatWithCommas, yoctoToNear } from '@/utils/libs';
import { DelegatorInfo, RewardFraction, ValidatorStatus } from '@/utils/types';
import { CurrentEpochValidatorInfo, ValidatorDescription } from 'nb-types';
import { useEffect, useRef, useState } from 'react';
import { Tooltip } from '@reach/tooltip';
import Image from 'next/image';
import { debounce } from 'lodash';
import Skeleton from '../skeleton/common/Skeleton';
import Table from '../common/Table';
import ErrorMessage from '../common/ErrorMessage';
import FaInbox from '../Icons/FaInbox';
import { Link } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { useConfig } from '@/hooks/app/useConfig';
import useRpc from '@/hooks/app/useRpc';
import { useRpcProvider } from '@/hooks/app/useRpcProvider';
import { useRpcStore } from '@/stores/app/rpc';
import Cookies from 'js-cookie';

interface Props {
  accountId: string;
}

const Delegators = ({ accountId }: Props) => {
  const {
    getAccount,
    getAccounts,
    getNumberOfAccounts,
    getValidators,
    getRewardFeeFraction,
    getFieldsByPool,
  } = useRpc();
  const { networkId } = useConfig();
  const searchParams = useSearchParams();
  const page = searchParams?.get('page');
  const theme = Cookies?.get('theme') || 'light';
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentEpochInfo, setCurrentEpochInfo] =
    useState<CurrentEpochValidatorInfo>();
  const [rewardFraction, setRewardFraction] = useState<RewardFraction>();
  const [contactInfo, setContactInfo] = useState<ValidatorDescription>();
  const pagination = { page: page ? Number(page) : 1, per_page: 25 };
  const [delegators, setDelegators] = useState<DelegatorInfo[]>();
  const [searchResults, setSearchResults] = useState<DelegatorInfo[]>([]);
  const [status, setStatus] = useState<string>();
  const [count, setCount] = useState<number>();
  const [_allRpcProviderError, setAllRpcProviderError] = useState(false);
  const initializedRef = useRef(false);

  const useRpcStoreWithProviders = () => {
    const setProviders = useRpcStore((state) => state.setProviders);
    const { RpcProviders } = useRpcProvider();
    useEffect(() => {
      if (!initializedRef.current) {
        initializedRef.current = true;
        setProviders(RpcProviders);
      }
    }, [RpcProviders, setProviders]);

    return useRpcStore((state) => state);
  };

  const { switchRpc, rpc: rpcUrl } = useRpcStoreWithProviders();
  const start = (pagination.page - 1) * pagination.per_page;

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'Active':
        return {
          textColor: 'text-emerald-500',
          bgColor:
            'bg-emerald-50 dark:dark:bg-emerald-500/[0.25] text-emerald-500 ',
        };
      case 'Joining':
        return {
          textColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-500/[0.25]  text-yellow-500',
        };
      case 'Kickout':
        return {
          textColor: 'text-red-500',
          bgColor: 'bg-red-50 text-red-500 dark:bg-red-500/[0.25]',
        };
      case 'Proposal':
        return {
          textColor: 'text-teal-900',
          bgColor:
            'bg-teal-300 dark:bg-teal-500/[0.25] dark:text-teal-500 text-teal-900',
        };
      case 'idle':
        return {
          textColor: 'text-gray-600',
          bgColor:
            'bg-gray-300 text-gray-600 dark:bg-gray-500/[0.25] dark:text-gray-400',
        };
      default:
        return {};
    }
  };

  const getUptimeColorClass = (uptime: number) => {
    if (uptime >= 90) {
      return {
        textColor: 'text-emerald-500',
        bgColor: 'bg-emerald-50 dark:bg-emerald-500/[0.25] text-emerald-500',
      };
    } else if (uptime >= 80) {
      return {
        textColor: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-500/[0.25] text-yellow-500',
      };
    } else {
      return {
        textColor: 'text-red-500',
        bgColor: 'bg-red-50 text-red-500 dark:bg-red-500/[0.25]',
      };
    }
  };

  const getStatus = (validator: ValidatorStatus) => {
    if (validator.currentEpoch) {
      if (validator.nextEpoch) {
        return 'Active';
      } else {
        return 'Kickout';
      }
    } else if (validator.nextEpoch) {
      return 'Joining';
    } else if (validator.afterNextEpoch) {
      return 'Proposal';
    }
    return 'idle';
  };

  const blocksProductivityRatio = currentEpochInfo
    ? currentEpochInfo.num_produced_blocks /
      currentEpochInfo.num_expected_blocks
    : 0;
  const chunksProductivityRatio = currentEpochInfo
    ? currentEpochInfo.num_produced_chunks /
      currentEpochInfo.num_expected_chunks
    : 0;

  const rewardRatio = rewardFraction
    ? rewardFraction?.numerator / rewardFraction?.denominator
    : 0;

  const debouncedSearch = useRef(
    debounce((value: any) => {
      if (!value || value.trim() === '') {
        setSearchResults([]);
        return;
      }
      getAccount(accountId, value).then((resp: any) => {
        if (resp.staked_balance === '0' && resp.unstaked_balance === '0') {
          setSearchResults([]);
        } else {
          setSearchResults([resp]);
        }
      });
    }, 500),
  ).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (error) {
      try {
        switchRpc();
      } catch (error) {
        setError(true);
        setAllRpcProviderError(true);
        console.error('Failed to switch RPC:', error);
      }
    }
  }, [error, switchRpc]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value: any = e?.target?.value;
    debouncedSearch(value);
  };

  function validatorStatus(result: any, poolId: string) {
    if (result) {
      let currentEpoch = [...result?.current_validators].some(
        (item) => item.account_id === poolId,
      );
      let nextEpoch = [...result?.next_validators].some(
        (item) => item.account_id === poolId,
      );
      let afterNextEpoch = [...result?.current_proposals].some(
        (item) => item.account_id === poolId,
      );
      let stat = getStatus({
        currentEpoch,
        nextEpoch,
        afterNextEpoch,
      });
      setStatus(stat);
      let validator = [...result?.current_validators];
      let epochInfo = validator.find((item) => item.account_id === poolId);
      setCurrentEpochInfo(epochInfo);
    }
  }

  useEffect(() => {
    getNumberOfAccounts(accountId).then((resp) => {
      if (typeof resp === 'number' && resp > 0) {
        setCount(resp);
      }
    });
    getAccounts(
      accountId,
      start,
      pagination.per_page,
      setLoading,
      setError,
    ).then((resp) => {
      setDelegators(resp);
    });
    getRewardFeeFraction(accountId).then((resp) => {
      setRewardFraction(resp);
    });
    getValidators().then((resp) => {
      validatorStatus(resp, accountId);
    });
    if (networkId === 'mainnet') {
      getFieldsByPool(accountId).then((resp) => {
        setContactInfo(resp);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, pagination.page, rpcUrl]);

  let data = searchResults!?.length > 0 ? searchResults : delegators;
  let totalCount = searchResults!?.length > 0 ? searchResults!?.length : count;

  const columns = [
    {
      header: <span>ACCOUNT</span>,
      key: 'accountId',
      cell: (row: DelegatorInfo) => (
        <>
          <Tooltip
            label={row?.account_id}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
          >
            <Link
              href={`/address/${row?.account_id}`}
              className="text-green-500 dark:text-green-250 hover:no-underline"
            >
              {row?.account_id}
            </Link>
          </Tooltip>
        </>
      ),
      tdClassName:
        'pl-7 py-2 w-[36rem] text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'pl-7 py-2 w-[36rem] text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider',
    },
    {
      header: <span>STAKED BALANCE</span>,
      key: 'staked_balance',
      cell: (row: DelegatorInfo) => (
        <span>
          {formatWithCommas(
            Number(yoctoToNear(row?.staked_balance, false))?.toFixed(0),
          ) + '  Ⓝ'}
        </span>
      ),
      tdClassName:
        'px-3 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-36',
      thClassName:
        'px-3 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap w-36',
    },
    {
      header: <span>UNSTAKED BALANCE</span>,
      key: 'unstaked_balance',
      cell: (row: DelegatorInfo) => (
        <span>
          {formatWithCommas(
            Number(yoctoToNear(row?.unstaked_balance, false))?.toFixed(0),
          ) + '  Ⓝ'}
        </span>
      ),
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-40',
      thClassName:
        'px-4 py-2 ml-5 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap w-40',
    },
  ];

  return (
    <div>
      <div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <div className="h-full bg-white  dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
              <div>
                <h2 className="flex justify-between border-b dark:border-black-200 p-3 text-gray-600 dark:text-neargray-10 text-sm font-semibold">
                  <span>Main Information</span>
                </h2>
              </div>
              <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600 dark:text-neargray-10">
                <div className="flex items-center justify-between py-4 h-14">
                  <div className="w-full md:w-1/4 sm:mb-2 md:mb-0">Status</div>
                  <div className="flex w-full md:w-3/4 items-center text-center">
                    {!loading ? (
                      (count || currentEpochInfo) &&
                      status && (
                        <span
                          className={`w-18 ${getStatusColorClass(status)
                            ?.bgColor} rounded-xl p-1 text-center sm:ml-0 ml-2`}
                        >
                          <span>{status}</span>
                        </span>
                      )
                    ) : (
                      <Skeleton className="h-4 w-16 break-words sm:ml-0 ml-2" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">Fee</div>
                  <div className="w-full md:w-3/4 break-words sm:ml-1 ml-6">
                    {!loading ? (
                      rewardFraction &&
                      !isNaN(rewardRatio) &&
                      `${
                        rewardRatio * 100 == 100
                          ? 100
                          : (rewardRatio * 100).toFixed(2)
                      }%`
                    ) : (
                      <Skeleton className="h-4 w-16 sm:-ml-1 -ml-1 break-words" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="w-full md:w-1/4 sm:mb-2 md:mb-0">Contact</div>
                  <div className="w-full md:w-3/4 break-words">
                    <div className="flex flex-wrap text-xs text-left sm:ml-0 ml-2.5 font-bold text-nearblue-600 dark:text-neargray-10 tracking-wider">
                      {!loading ? (
                        networkId === 'mainnet' && (
                          <>
                            {contactInfo && (
                              <>
                                {contactInfo?.url && (
                                  <a
                                    className="text-green-500 dark:text-green-250 underline mr-2"
                                    href={
                                      contactInfo?.url &&
                                      contactInfo?.url?.startsWith('http')
                                        ? contactInfo?.url
                                        : `http://${contactInfo?.url}`
                                    }
                                    rel="noreferrer noopener"
                                    target="_blank"
                                  >
                                    <Image
                                      width={16}
                                      height={16}
                                      className="w-5 h-5"
                                      src={
                                        theme === 'dark'
                                          ? '/images/web_icon_black.svg'
                                          : '/images/web_icon.svg'
                                      }
                                      alt="Web"
                                    />
                                  </a>
                                )}
                                {contactInfo?.email && (
                                  <a
                                    className="text-green-500 dark:text-green-250 hover:no-underline mr-2"
                                    href={`mailto:${contactInfo?.email}`}
                                    rel="noreferrer noopener"
                                    target="_blank"
                                  >
                                    <Image
                                      width={16}
                                      height={16}
                                      className="w-5 h-5"
                                      src={
                                        theme === 'dark'
                                          ? '/images/email_icon_black.svg'
                                          : '/images/email_icon.svg'
                                      }
                                      alt="Email"
                                    />
                                  </a>
                                )}
                                {contactInfo?.twitter && (
                                  <a
                                    className="text-green-500 dark:text-green-250 hover:no-underline mr-2"
                                    href={
                                      contactInfo?.twitter &&
                                      contactInfo?.twitter?.includes('http')
                                        ? contactInfo?.twitter
                                        : `https://twitter.com/${contactInfo?.twitter}`
                                    }
                                    rel="noreferrer noopener"
                                    target="_blank"
                                  >
                                    <Image
                                      width={16}
                                      height={16}
                                      className="w-5 h-5"
                                      src={
                                        theme === 'dark'
                                          ? '/images/twitter_icon_black.svg'
                                          : '/images/twitter_icon.svg'
                                      }
                                      alt="Twitter"
                                      priority
                                    />
                                  </a>
                                )}
                                {contactInfo?.discord && (
                                  <a
                                    className="text-green-500 dark:text-green-250 hover:no-underline mr-2"
                                    href={
                                      contactInfo?.discord &&
                                      contactInfo?.discord?.includes('http')
                                        ? contactInfo?.discord
                                        : `https://discord.com/invite/${contactInfo?.discord}`
                                    }
                                    rel="noreferrer noopener"
                                    target="_blank"
                                  >
                                    <Image
                                      width={16}
                                      height={16}
                                      className="w-5 h-5"
                                      src={
                                        theme === 'dark'
                                          ? '/images/discord_icon_black.svg'
                                          : '/images/discord_icon.svg'
                                      }
                                      alt="Discord"
                                    />
                                  </a>
                                )}
                                {contactInfo?.github && (
                                  <a
                                    className="text-green-500 dark:text-green-250 hover:no-underline mr-2"
                                    href={
                                      contactInfo?.github &&
                                      contactInfo?.github?.includes('http')
                                        ? contactInfo?.github
                                        : `https://github.com/${contactInfo?.github}`
                                    }
                                    rel="noreferrer noopener"
                                    target="_blank"
                                  >
                                    <Image
                                      width={16}
                                      height={16}
                                      className="w-5 h-5"
                                      src={
                                        theme === 'dark'
                                          ? '/images/github_icon_black.svg'
                                          : '/images/github_icon.svg'
                                      }
                                      alt="Github"
                                      priority
                                    />
                                  </a>
                                )}
                                {contactInfo?.telegram && (
                                  <a
                                    className="text-green-500 dark:text-green-250 hover:no-underline mr-2"
                                    href={
                                      contactInfo?.telegram &&
                                      (contactInfo?.telegram?.startsWith(
                                        'http',
                                      ) ||
                                        contactInfo?.telegram?.startsWith(
                                          'https',
                                        ))
                                        ? contactInfo?.telegram
                                        : `https://t.me/${contactInfo?.telegram}`
                                    }
                                    rel="noreferrer noopener"
                                    target="_blank"
                                  >
                                    <Image
                                      width={16}
                                      height={16}
                                      className="w-5 h-5"
                                      src={
                                        theme === 'dark'
                                          ? '/images/telegram_black.svg'
                                          : '/images/telegram.svg'
                                      }
                                      alt="Telegram"
                                    />
                                  </a>
                                )}
                              </>
                            )}
                          </>
                        )
                      ) : (
                        <Skeleton className="h-4 sm:w-44 w-25 break-words sm:ml-0 -ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
              <h2 className="border-b dark:border-black-200 p-3 text-gray-600 dark:text-neargray-10 text-sm font-semibold">
                Uptime information
              </h2>
              <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600 dark:text-neargray-10">
                <div className="flex items-center py-4 sm:h-16">
                  <div className="w-60 md:w-1/4 sm:mb-2 md:mb-0">Blocks</div>
                  {!loading ? (
                    currentEpochInfo && (
                      <>
                        <div className="flex w-16">
                          {!isNaN(blocksProductivityRatio) && (
                            <span
                              className={`w-full ${
                                getUptimeColorClass(
                                  blocksProductivityRatio * 100,
                                ).bgColor
                              }  whitespace-nowrap rounded-xl p-1 text-center`}
                            >
                              {`${
                                blocksProductivityRatio * 100 == 100
                                  ? 100
                                  : (blocksProductivityRatio * 100).toFixed(2)
                              }
                              %`}
                            </span>
                          )}
                        </div>
                        <span className="flex ml-2">
                          {!isNaN(blocksProductivityRatio) &&
                            `${formatWithCommas(
                              currentEpochInfo?.num_produced_blocks?.toString(),
                            )} produced / ${formatWithCommas(
                              currentEpochInfo?.num_expected_blocks?.toString(),
                            )} expected`}
                        </span>
                      </>
                    )
                  ) : (
                    <Skeleton className="h-7 w-65 break-words" />
                  )}
                </div>
                <div className="flex items-center py-4 sm:h-16">
                  <div className="w-64 md:w-1/4 sm:mb-2 md:mb-0">Chunks</div>
                  {!loading ? (
                    currentEpochInfo && (
                      <>
                        <div className="flex w-16">
                          {!isNaN(chunksProductivityRatio) && (
                            <span
                              className={`w-full  ${
                                getUptimeColorClass(
                                  chunksProductivityRatio * 100,
                                ).bgColor
                              } whitespace-nowrap rounded-xl p-1 text-center`}
                            >
                              {`${
                                chunksProductivityRatio * 100 == 100
                                  ? 100
                                  : (chunksProductivityRatio * 100).toFixed(2)
                              }
                              %`}
                            </span>
                          )}
                        </div>
                        <span className="flex ml-2">
                          {!isNaN(chunksProductivityRatio) &&
                            `${formatWithCommas(
                              currentEpochInfo?.num_produced_chunks?.toString(),
                            )} produced / ${formatWithCommas(
                              currentEpochInfo?.num_expected_chunks?.toString(),
                            )} expected`}
                        </span>
                      </>
                    )
                  ) : (
                    <Skeleton className="h-7 w-65 break-words" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-5"></div>
      <div className="w-full mb-10">
        <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
          <div className="flex flex-row items-center justify-between text-left text-sm text-nearblue-600 dark:text-neargray-10 px-3 pl-3 mb-4 mt-4">
            {loading ? (
              <div className="leading-7 py-3 w-80">
                <Skeleton className="h-4 break-words" />
              </div>
            ) : (
              count && (
                <>
                  <div className="flex flex-col">
                    <div className="leading-7">
                      {`${formatWithCommas(count?.toString())} Delegator${
                        count === 1 ? '' : 's'
                      } found`}
                    </div>
                  </div>
                  <div className={`flex w-full h-10 sm:w-80 mr-2`}>
                    <div className="flex-grow">
                      <label htmlFor="token-search" id="token-search">
                        <input
                          name="search"
                          autoComplete="off"
                          placeholder="Search"
                          className="search ml-2 pl-8 token-search bg-white dark:bg-black-600 dark:border-black-200 w-full h-full text-sm py-2 outline-none border rounded-xl"
                          onChange={onChange}
                        />
                      </label>
                    </div>
                  </div>
                </>
              )
            )}
          </div>
          <div className="flex flex-col">
            <Table
              columns={columns}
              data={data}
              limit={pagination.per_page}
              isPagination={true}
              isLoading={loading}
              count={totalCount}
              pageLimit={9999}
              Error={error}
              ErrorText={
                <ErrorMessage
                  icons={<FaInbox />}
                  message={'No delegators found'}
                  mutedText="Please try again later"
                />
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Delegators;
