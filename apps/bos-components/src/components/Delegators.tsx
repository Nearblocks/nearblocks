/**
 * Component: Delegators
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Delegators on Node validator under Near Protocol.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {number} [currentPage] - The current page number being displayed. (Optional)
 *                                 Example: If provided, currentPage=3 will display the third page of blocks.
 * @param {function} [setPage] - A function used to set the current page. (Optional)
 *                               Example: setPage={handlePageChange} where handlePageChange is a function to update the page.
 * @param {string} ownerId - The identifier of the owner of the component.
 * @param {string} accountId - The identifier for the validator acccount.
 */

interface Props {
  network: string;
  accountId: string;
  currentPage: number;
  setPage: (page: number) => void;
  ownerId: string;
  theme: string;
}

import FaInbox from '@/includes/icons/FaInbox';
import Skeleton from '@/includes/Common/Skeleton';
import { decodeArgs, encodeArgs } from '@/includes/near';
import ErrorMessage from '@/includes/Common/ErrorMessage';
import {
  DelegatorInfo,
  RewardFraction,
  ValidatorStatus,
} from '@/includes/types';
import { CurrentEpochValidatorInfo, ValidatorDescription } from 'nb-types';

export default function ({
  network,
  accountId,
  ownerId,
  currentPage,
  setPage,
  theme,
}: Props) {
  const { formatWithCommas } = VM.require(
    `${ownerId}/widget/includes.Utils.formats`,
  );
  const { debounce, getConfig, yoctoToNear } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );
  const [delegators, setDelegators] = useState<DelegatorInfo[] | undefined>([]);
  const [searchResults, setSearchResults] = useState<
    DelegatorInfo[] | undefined
  >(undefined);
  const [currentEpochInfo, setCurrentEpochInfo] = useState<
    CurrentEpochValidatorInfo | undefined
  >(undefined);
  const [rewardFraction, setRewardFraction] = useState<
    RewardFraction | undefined
  >(undefined);
  const [contactInfo, setContactInfo] = useState<
    ValidatorDescription | undefined
  >(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [count, setCount] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const config = getConfig && getConfig(network);
  const LIMIT = 25;
  const start = (currentPage - 1) * LIMIT;

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

  const fetchDelegatorsCount = (poolId: string) => {
    const retryLimit = 2;
    setLoading(true);
    const fetch = () => {
      asyncFetch(`${config?.rpcUrl}`, {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            account_id: poolId,
            args_base64: 'e30=',
            finality: 'optimistic',
            method_name: 'get_number_of_accounts',
            request_type: 'call_function',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res: any) => {
          if (res.status === 200 && !res.body.error) {
            const result = decodeArgs(res.body.result.result);
            setCount(result);
            let innerRetries = 0;
            const fetchInner = () => {
              asyncFetch(`${config?.rpcUrl}`, {
                method: 'POST',
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  id: 'dontcare',
                  method: 'query',
                  params: {
                    account_id: poolId,
                    args_base64: encodeArgs({
                      from_index: start,
                      limit: LIMIT,
                    }),
                    finality: 'optimistic',
                    method_name: 'get_accounts',
                    request_type: 'call_function',
                  },
                }),
                headers: {
                  'Content-Type': 'application/json',
                },
              })
                .then((res: any) => {
                  if (res.status === 200 && !res.body.error) {
                    const result = decodeArgs(res.body.result.result);
                    if (result.length > 0) {
                      setDelegators(result);
                      setLoading(false);
                    } else {
                      setDelegators(undefined);
                      setLoading(false);
                    }
                  } else {
                    if (innerRetries < retryLimit) {
                      innerRetries++;
                      fetchInner();
                    } else {
                      setDelegators(undefined);
                      setLoading(false);
                      console.log(res.body.error.cause.name);
                    }
                  }
                })
                .catch(() => {});
            };
            fetchInner();
          } else {
            setDelegators(undefined);
            setCount(undefined);
            setLoading(false);
            console.log(res.body.error.cause.name);
          }
        })
        .catch(() => {});
    };
    fetch();
  };

  function fetchValidators(poolId: string) {
    setLoading(true);
    asyncFetch(`${config?.rpcUrl}`, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'dontcare',
        method: 'validators',
        params: [null],
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res: any) => {
        const result = res.body.result;
        if (res.status === 200 && !res.body.error) {
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
        } else {
          console.log(res.body.error.cause.name);
          setCurrentEpochInfo(undefined);
          setStatus(undefined);
        }
      })
      .catch(() => {});
  }

  const fetchRewardRatio = (poolId: string) => {
    asyncFetch(`${config?.rpcUrl}`, {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'dontcare',
        method: 'query',
        params: {
          account_id: poolId,
          args_base64: 'e30=',
          finality: 'optimistic',
          method_name: 'get_reward_fee_fraction',
          request_type: 'call_function',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res: any) => {
        const result = decodeArgs(res.body.result.result);
        if (res.status === 200 && !res.body.error) {
          setRewardFraction(result);
        } else {
          setRewardFraction(undefined);
          console.log(res.body.error.cause.name);
        }
      })
      .catch(() => {});
  };

  const fetchContactInfo = (poolId: string) => {
    if (network === 'mainnet') {
      asyncFetch(`${config?.rpcUrl}`, {
        method: 'POST',
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            account_id: 'pool-details.near',
            args_base64: encodeArgs({ pool_id: poolId }),
            finality: 'optimistic',
            method_name: 'get_fields_by_pool',
            request_type: 'call_function',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res: any) => {
          const result = decodeArgs(res.body.result.result);
          if (res.status === 200 && !res.body.error) {
            setContactInfo(result);
          } else {
            console.log(res.body.error.cause.name);
            setContactInfo(undefined);
          }
        })
        .catch(() => {});
    }
  };

  const debouncedSearch = useMemo(() => {
    return (
      debounce &&
      debounce(500, (value: string) => {
        if (!value || value.trim() === '') {
          setSearchResults([]);
          return;
        }
        asyncFetch(`${config?.rpcUrl}`, {
          method: 'POST',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'dontcare',
            method: 'query',
            params: {
              account_id: accountId,
              args_base64: encodeArgs({ account_id: value }),
              finality: 'optimistic',
              method_name: 'get_account',
              request_type: 'call_function',
            },
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res: any) => {
            const result = decodeArgs(res.body.result.result);
            if (res.status === 200 && !res.body.error) {
              if (
                result.staked_balance === '0' &&
                result.unstaked_balance === '0'
              ) {
                setSearchResults(undefined);
              } else {
                setSearchResults([result]);
              }
            } else {
              console.log(res.body.error.cause.name);
              setSearchResults(undefined);
            }
          })
          .catch(() => {});
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  useEffect(() => {
    fetchContactInfo(accountId);
    fetchRewardRatio(accountId);
    fetchDelegatorsCount(accountId);
    fetchValidators(accountId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, currentPage]);

  const columns = [
    {
      header: <span>ACCOUNT</span>,
      key: 'accountId',
      cell: (row: DelegatorInfo) => (
        <>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Link
                  href={`/address/${row.account_id}`}
                  className="hover:no-underline"
                >
                  <a className="text-green-500 dark:text-green-250 hover:no-underline">
                    {row.account_id}
                  </a>
                </Link>
              </Tooltip.Trigger>
              <Tooltip.Content
                className=" h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2 break-words"
                align="start"
                side="top"
              >
                {row.account_id}
              </Tooltip.Content>
            </Tooltip.Root>
          </Tooltip.Provider>
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
            Number(yoctoToNear(row.staked_balance, false)).toFixed(0),
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
            Number(yoctoToNear(row.unstaked_balance, false)).toFixed(0),
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
                <div className="flex items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">Status</div>
                  <div className="flex w-full md:w-3/4 items-center text-center">
                    {!loading ? (
                      (count || currentEpochInfo) &&
                      status && (
                        <span
                          className={`w-18 ${
                            getStatusColorClass(status).bgColor
                          } rounded-xl p-1 text-center sm:ml-0 ml-2`}
                        >
                          <span>{status}</span>
                        </span>
                      )
                    ) : (
                      <Skeleton className="h-7 w-16 break-words sm:ml-0 ml-2" />
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
                      <Skeleton className="h-4 w-12 sm:-ml-1 -ml-1 break-words" />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="w-full md:w-1/4 mb-2 md:mb-0">Contact</div>
                  <div className="w-full md:w-3/4 break-words">
                    <div className="flex flex-wrap text-xs text-left sm:ml-0 ml-2.5 font-bold text-nearblue-600 dark:text-neargray-10 tracking-wider">
                      {!loading ? (
                        network === 'mainnet' && (
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
                                    <img
                                      width="16"
                                      height="16"
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
                                    <img
                                      width="16"
                                      height="16"
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
                                    <img
                                      width="16"
                                      height="16"
                                      className="w-5 h-5"
                                      src={
                                        theme === 'dark'
                                          ? '/images/twitter_icon_black.svg'
                                          : '/images/twitter_icon.svg'
                                      }
                                      alt="Twitter"
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
                                    <img
                                      width="16"
                                      height="16"
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
                                    <img
                                      width="16"
                                      height="16"
                                      className="w-5 h-5"
                                      src={
                                        theme === 'dark'
                                          ? '/images/github_icon_black.svg'
                                          : '/images/github_icon.svg'
                                      }
                                      alt="Github"
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
                                    <img
                                      width="16"
                                      height="16"
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
                        <Skeleton className="h-4 sm:w-44 break-words sm:ml-0 -ml-0.5" />
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
                <div className="flex items-center py-4">
                  <div className="w-60 md:w-1/4 mb-2 md:mb-0">Blocks</div>
                  {!loading ? (
                    currentEpochInfo && (
                      <>
                        <div className="flex w-16">
                          {!isNaN(blocksProductivityRatio) && (
                            <span className="w-full bg-emerald-50 dark:dark:bg-emerald-500/[0.25] text-emerald-500  whitespace-nowrap rounded-xl p-1 text-center">
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
                              currentEpochInfo.num_produced_blocks,
                            )} produced / ${formatWithCommas(
                              currentEpochInfo.num_expected_blocks,
                            )} expected`}
                        </span>
                      </>
                    )
                  ) : (
                    <Skeleton className="h-7 sm:w-65 w-full break-words" />
                  )}
                </div>
                <div className="flex items-center py-4">
                  <div className="w-64 md:w-1/4 mb-2 md:mb-0">Chunks</div>
                  {!loading ? (
                    currentEpochInfo && (
                      <>
                        <div className="flex w-16">
                          {!isNaN(chunksProductivityRatio) && (
                            <span className="w-full bg-emerald-50 dark:dark:bg-emerald-500/[0.25] text-emerald-500 whitespace-nowrap rounded-xl p-1 text-center">
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
                              currentEpochInfo.num_produced_chunks,
                            )} produced / ${formatWithCommas(
                              currentEpochInfo.num_expected_chunks,
                            )} expected`}
                        </span>
                      </>
                    )
                  ) : (
                    <Skeleton className="h-7 sm:w-65 w-full break-words" />
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
              count &&
              count !== 0 && (
                <>
                  <div className="flex flex-col">
                    <div className="leading-7">
                      {`${formatWithCommas(count)} Delegator${
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
            <Widget
              src={`${ownerId}/widget/bos-components.components.Shared.Table`}
              props={{
                columns: columns,
                data: searchResults!.length > 0 ? searchResults : delegators,
                isLoading: loading,
                limit: 25,
                isPagination: true,
                page:
                  searchResults!.length > 0
                    ? searchResults!.length
                    : currentPage,
                setPage: setPage,
                count:
                  searchResults!.length > 0 ? searchResults!.length : count,
                Error: (
                  <ErrorMessage
                    icons={<FaInbox />}
                    message={'No delegators found'}
                    mutedText="Please try again later"
                  />
                ),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
