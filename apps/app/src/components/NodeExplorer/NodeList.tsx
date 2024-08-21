import { useEffect, useState } from 'react';
import {
  convertAmountToReadableString,
  convertTimestampToTime,
  formatNumber,
  formatWithCommas,
  shortenAddress,
  timeAgo,
  yoctoToNear,
} from '@/utils/libs';
import Link from 'next/link';
import ArrowDown from '../Icons/ArrowDown';
import Question from '../Icons/Question';
import ErrorMessage from '../common/ErrorMessage';
import FaInbox from '../Icons/FaInbox';
import { Tooltip } from '@reach/tooltip';
import { ValidatorEpochData } from 'nb-types';
import { useTheme } from 'next-themes';
import Table from '../common/Table';
import Big from 'big.js';
import Image from 'next/image';

const NodeList = ({ data, totalSupply, latestBlock, error }: any) => {
  const { theme } = useTheme();
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [expanded, setExpanded] = useState<number[]>([]);
  const errorMessage = 'No validator data!';

  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const TotalSupply = totalSupply
    ? yoctoToNear(totalSupply?.stats[0].total_supply || '0', false)
    : '';

  useEffect(() => {
    if (data) {
      setTimeRemaining(data.totalSeconds ?? 0);
      setElapsedTime(data.elapsedTimeData ?? 0);
      setTotalCount(data.total ?? 0);
    }
  }, [data]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeRemaining((prevTimeRemaining) =>
        Math.max(prevTimeRemaining - 1, 0),
      );
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [data]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [data]);

  const handleRowClick = (rowIndex: number) => {
    const isRowExpanded = expanded.includes(rowIndex);

    if (isRowExpanded) {
      setExpanded((prevExpanded) =>
        prevExpanded.filter((index) => index !== rowIndex),
      );
    } else {
      setExpanded((prevExpanded) => [...prevExpanded, rowIndex]);
    }
  };

  const stakingStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'joining':
        return 'Joining';

      case 'leaving':
        return 'Kickout';
      case 'proposal':
        return 'Proposal';
      case 'idle':
        return 'idle';

      case 'newcomer':
        return 'Newcomer';
      case 'onHold':
        return 'On hold';
      default:
        return;
    }
  };
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'active':
        return {
          textColor: 'text-emerald-500',
          bgColor:
            'bg-emerald-50 dark:dark:bg-emerald-500/[0.25] text-emerald-500 ',
        };
      case 'joining':
        return {
          textColor: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-500/[0.25]  text-yellow-500',
        };
      case 'leaving':
        return {
          textColor: 'text-red-500',
          bgColor: 'bg-red-50 text-red-500 dark:bg-red-500/[0.25]',
        };
      case 'proposal':
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
      case 'newcomer':
        return {
          textColor: 'text-orange-500',
          bgColor:
            'bg-orange-500 text-white dark:bg-orange-500/[0.25] dark:text-orange-300',
        };
      case 'onHold':
        return {
          textColor: 'text-blue-500',
          bgColor:
            'bg-blue-500 dark:bg-blue-500/[0.25] dark:text-blue-400 text-white',
        };
      default:
        return {};
    }
  };

  const columns = [
    {
      header: <span></span>,
      key: '',
      cell: (row: ValidatorEpochData) => (
        <button onClick={() => handleRowClick(row.index || 0)}>
          <ArrowDown
            className={`${
              expanded.includes(row.index || 0) ? 'rotate-180' : 'rotate-0'
            } dark:text-neargray-10`}
          />
        </button>
      ),
      tdClassName:
        'px-7 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-20',
      thClassName:
        'px-7 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-20',
    },
    {
      header: <span>Location</span>,
      key: '',
      cell: (row: ValidatorEpochData) =>
        row?.description?.country_code ? (
          <div className="relative">
            <Tooltip
              label={row?.description?.country}
              className="absolute top-0 left-0  h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
            >
              <Image
                src={`https://flagcdn.com/48x36/${row?.description?.country_code?.toLowerCase()}.png`}
                alt={row?.description?.country as string}
                width={20}
                height={20}
                layout="fixed"
                unoptimized
              />
            </Tooltip>
          </div>
        ) : (
          <div className="w-4 h-4 bg-gray-300 text-black flex items-center justify-center text-xs dark:bg-black-200 dark:text-white">
            ?
          </div>
        ),
      tdClassName:
        'pl-2 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-24',
      thClassName:
        'pl-2 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-24',
    },
    {
      header: <span>Status</span>,
      key: 'View',
      cell: (row: ValidatorEpochData) => (
        <div
          className={`inline-block ${
            getStatusColorClass(row?.stakingStatus ?? '').bgColor
          } rounded-xl p-1 text-center`}
        >
          <div>{stakingStatusLabel(row?.stakingStatus ?? '')}</div>
        </div>
      ),
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-xs text-nearblue-600 dark:text-neargray-10 w-20',
      thClassName:
        'px-4 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-20',
    },
    {
      header: <span>VALIDATOR</span>,
      key: 'accountId',
      cell: (row: ValidatorEpochData) => (
        <>
          <button>
            <Tooltip
              label={row.accountId}
              className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
            >
              <Link
                href={`/node-explorer/${row.accountId}`}
                className="text-green-500 dark:text-green-250 hover:no-underline"
              >
                {shortenAddress(row.accountId)}
              </Link>
            </Tooltip>
          </button>

          <Tooltip
            label={row.publicKey}
            className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
          >
            <span>{row.publicKey ? shortenAddress(row.publicKey) : ''}</span>
          </Tooltip>
        </>
      ),
      tdClassName:
        'px-4 py-2 text-sm text-nearblue-600 dark:text-neargray-10 w-60',
      thClassName:
        'px-4 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-60',
    },
    {
      header: <span>FEE</span>,
      key: 'poolInfo',
      cell: (row: ValidatorEpochData) => (
        <div>
          {row?.poolInfo?.fee !== undefined
            ? `${(
                (row?.poolInfo?.fee!.numerator /
                  row?.poolInfo?.fee!.denominator) *
                100
              ).toFixed(0)}%`
            : 'N/A'}
        </div>
      ),
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-24',
      thClassName:
        'px-4 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-24',
    },
    {
      header: <span>APY</span>,
      key: 'APY',
      cell: (row: ValidatorEpochData) => {
        const fee: any = row?.poolInfo?.fee;
        const lastEpochApy: any = data?.lastEpochApy ?? 0;

        let adjustedApy = 'N/A';

        if (fee !== undefined && lastEpochApy !== undefined) {
          const calculatedApy =
            lastEpochApy - lastEpochApy * (fee.numerator / fee.denominator);
          adjustedApy =
            calculatedApy === 0 ? '0%' : `${calculatedApy.toFixed(2)}%`;
        }

        return <div>{adjustedApy}</div>;
      },
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-24',
      thClassName:
        'px-4 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-24',
    },
    {
      header: <span>DELEGATORS</span>,
      key: 'deligators',
      cell: (row: ValidatorEpochData) => {
        return (
          <div>
            {row?.poolInfo?.delegatorsCount !== undefined &&
            row.poolInfo.delegatorsCount !== null
              ? formatWithCommas(row.poolInfo.delegatorsCount.toString())
              : 'N/A'}
          </div>
        );
      },
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10 w-40',
      thClassName:
        'px-4 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider w-40',
    },
    {
      header: <span>TOTAL STAKE</span>,
      key: 'stake',
      cell: (row: ValidatorEpochData) => (
        <span>
          {(row.currentEpoch?.stake ??
            row.nextEpoch?.stake ??
            row.afterNextEpoch?.stake ??
            row.contractStake) &&
            formatWithCommas(
              Number(
                yoctoToNear(
                  row.currentEpoch?.stake ??
                    row.nextEpoch?.stake ??
                    row.afterNextEpoch?.stake ??
                    `${row.contractStake}` ??
                    '0',
                  false,
                ),
              ).toFixed(0),
            ) + '  Ⓝ'}
        </span>
      ),
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>STAKE %</span>,
      key: 'percentage',
      cell: (row: ValidatorEpochData) => {
        return <div>{row?.percent}%</div>;
      },
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>CUMULATIVE STAKE</span>,
      key: 'cumulative_stake',
      cell: (row: ValidatorEpochData) => {
        return (
          <div>
            <div className="relative w-50 h-7 soft-shadow rounded-xl overflow-hidden bg-gray-300 dark:bg-black-200">
              <div
                className="absolute top-0 left-0 right-0 bottom-0 h-full bg-green-500 text-center flex items-center justify-center"
                style={{
                  width: `${row?.cumulativeStake?.cumulativePercent || 0}%`,
                }}
              ></div>
              <span className="absolute  text-white inset-0 flex items-center justify-center">
                {row?.cumulativeStake?.cumulativePercent
                  ? `${row?.cumulativeStake?.cumulativePercent}%`
                  : 'N/A'}
              </span>
            </div>
          </div>
        );
      },
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
    {
      header: <span>STAKE CHANGE (24H)</span>,
      key: '24_change',
      cell: (row: ValidatorEpochData) => {
        if (!row?.stakeChange?.value) {
          const visibleStake =
            row?.currentEpoch?.stake ??
            row?.nextEpoch?.stake ??
            row?.afterNextEpoch?.stake ??
            row?.contractStake;
          if (visibleStake) {
            return `${convertAmountToReadableString(
              visibleStake,
              'seatPriceAmount',
            )}  Ⓝ`;
          }
          return null;
        }
        return (
          <div
            className={`flex ${
              row?.stakeChange.symbol === '+'
                ? 'text-neargreen'
                : 'text-red-500'
            }`}
          >
            <div>{row?.stakeChange?.symbol}</div>
            <p>{row?.stakeChange?.value} Ⓝ</p>
          </div>
        );
      },
      tdClassName:
        'px-4 py-2 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10',
      thClassName:
        'px-4 py-2 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider whitespace-nowrap',
    },
  ];
  const validatorEpochData =
    data?.validatorFullData?.length > 0 ? data?.validatorFullData : [];

  const ExpandedRow = (row: ValidatorEpochData) => {
    const telemetry = data?.validatorTelemetry[row.accountId];
    const progress = row?.currentEpoch?.progress;

    const productivityRatio = progress
      ? (progress.blocks.produced + progress.chunks.produced) /
        (progress.blocks.total + progress.chunks.total)
      : 0;
    const socialMedia =
      row?.description?.twitter ||
      row?.description?.discord ||
      row?.description?.github ||
      row?.description?.telegram;

    return (
      <>
        <tr className="border-none bg-gray-50 dark:bg-black-300">
          {telemetry && (
            <>
              <td colSpan={2} className="pl-8 py-2">
                <div className="flex flex-wrap text-xs text-left font-semibold text-nearblue-600 dark:text-neargray-10 tracking-wider py-2">
                  <div className="flex uppercase">
                    <div>Uptime</div>
                    <div className="relative">
                      <Tooltip
                        label={
                          'Uptime is estimated by the ratio of the number of produced blocks to the number of expected blocks. '
                        }
                        className="absolute top-0 left-0 h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                      >
                        <button>
                          <Question className="w-4 h-4 fill-current ml-1" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap text-xs text-left font-bold text-nearblue-600 dark:text-neargray-10 tracking-wider">
                  {!isNaN(productivityRatio)
                    ? `${
                        productivityRatio * 100 == 100
                          ? 100
                          : (productivityRatio * 100).toFixed(3)
                      }%`
                    : '-'}
                </div>
              </td>
              <td colSpan={2} className="px-4 py-2">
                <div className="flex flex-wrap text-xs text-left font-semibold text-nearblue-600 dark:text-neargray-10 tracking-wider py-2">
                  <div className="flex uppercase whitespace-nowrap">
                    <div>Latest block</div>
                    <Tooltip
                      label={
                        'The block height the validation node reported in the most recent telemetry heartbeat.'
                      }
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    >
                      <button>
                        <Question className="w-4 h-4 fill-current ml-1" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
                <div
                  className={`flex flex-wrap text-xs text-left font-bold  tracking-wider  ${
                    Math.abs(
                      telemetry.lastHeight - latestBlock.blocks[0].block_height,
                    ) > 1000
                      ? 'text-red-500 dark:text-red-500'
                      : Math.abs(
                          telemetry.lastHeight -
                            latestBlock.blocks[0].block_height,
                        ) > 50
                      ? 'text-yellow-500 dark:text-yellow-500'
                      : 'text-black dark:text-white '
                  }`}
                >
                  {telemetry?.lastHeight ? telemetry?.lastHeight : '-'}
                </div>
              </td>
              <td colSpan={3} className="px-4 py-2">
                <div className="flex flex-wrap text-xs text-left font-semibold text-nearblue-600 dark:text-neargray-10 tracking-wider py-2">
                  <div className="flex uppercase whitespace-nowrap">
                    <div>Latest Telemetry Update</div>
                    <Tooltip
                      label={
                        'Telemetry is a regular notification coming from the nodes which includes generic information like the latest known block height, and the version of NEAR Protocol agent (nearcore).'
                      }
                      className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                    >
                      <button>
                        <Question className="w-4 h-4 fill-current ml-1" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
                <div
                  className={`flex flex-wrap text-xs text-left font-bold text-black dark:text-white tracking-wider`}
                >
                  {telemetry?.lastSeen ? timeAgo(telemetry?.lastSeen) : '-'}
                </div>
              </td>
              <td colSpan={2} className="px-4 py-2">
                <div className="flex flex-wrap text-xs text-left font-semibold text-nearblue-600 dark:text-neargray-10 tracking-wider py-2">
                  <div className="flex uppercase whitespace-nowrap">
                    <div>Node Agent Name</div>
                    <div className="relative">
                      <Tooltip
                        label={
                          <span>
                            NEAR Protocol could have multiple implementations,
                            so agent is the name of that implementation, where
                            &quot;near-rs&quot; is &nbsp;
                            <Link
                              href="https://github.com/near/nearcore"
                              target="_blank"
                              className="text-green-250 hover:no-underline"
                            >
                              the official implementation.
                            </Link>
                          </span>
                        }
                        className="absolute h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                      >
                        <button>
                          <Question className="w-4 h-4 fill-current ml-1" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex flex-wrap text-xs text-left  text-nearblue-600 dark:text-neargray-10 tracking-wider`}
                >
                  {telemetry?.agentName ? (
                    <span className="rounded bg-gray-300 dark:bg-black-200 px-1">
                      {telemetry?.agentName}
                    </span>
                  ) : (
                    '-'
                  )}
                </div>
              </td>
              <td colSpan={2} className="px-4 py-2">
                <div className="flex flex-wrap text-xs text-left font-semibold text-nearblue-600 dark:text-neargray-10 tracking-wider uppercase whitespace-nowrap py-2">
                  Node Agent Version / Build
                </div>
                <div
                  className={`flex flex-wrap text-xs text-left  text-nearblue-600 dark:text-neargray-10 tracking-wider`}
                >
                  {telemetry?.agentVersion || telemetry?.agentBuild ? (
                    <span className="rounded bg-gray-300 dark:bg-black-200 px-1">
                      {telemetry?.agentVersion}/${telemetry?.agentBuild}
                    </span>
                  ) : (
                    '-'
                  )}
                </div>
              </td>
            </>
          )}
        </tr>
        <tr className="border-none bg-gray-50 dark:bg-black-300">
          {row?.description && (
            <>
              <td colSpan={2} className="pl-8 pt-2 pb-4 align-top">
                <div className="flex flex-wrap text-xs text-left font-semibold text-nearblue-600 dark:text-neargray-10 tracking-wider py-2">
                  <div className="flex uppercase">Name</div>
                </div>
                <div className="text-xs text-left font-bold text-nearblue-600 dark:text-neargray-10 tracking-wider">
                  <div className="flex items-center">
                    {row?.description?.name ? (
                      <>
                        {row?.description?.logo &&
                          row?.description?.logo?.startsWith('http') && (
                            <span className="mr-1 flex justify-center">
                              <Image
                                src={row?.description?.logo}
                                alt={row?.description?.name}
                                width={20}
                                height={20}
                              />
                            </span>
                          )}
                        {row?.description?.name}
                      </>
                    ) : (
                      '-'
                    )}
                  </div>
                </div>
              </td>
              <td colSpan={2} className="px-4 pt-2 pb-4 align-top">
                <div className="flex flex-wrap text-xs text-left font-semibold text-nearblue-600 dark:text-neargray-10 tracking-wider py-2">
                  <div className="flex uppercase whitespace-nowrap">
                    Social Media
                  </div>
                </div>
                <div className="flex flex-wrap text-xs text-left font-bold text-nearblue-600 dark:text-neargray-10 tracking-wider">
                  {socialMedia ? (
                    <>
                      {row?.description?.url && (
                        <a
                          className="text-green-500 dark:text-green-250 underline mr-2"
                          href={
                            row?.description?.url &&
                            row?.description?.url?.startsWith('http')
                              ? row?.description?.url
                              : `http://${row?.description?.url}`
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
                      {row?.description?.email && (
                        <a
                          className="text-green-500 dark:text-green-250 hover:no-underline mr-2"
                          href={`mailto:${row?.description?.email}`}
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
                      {row?.description?.twitter && (
                        <a
                          className="text-green-500 dark:text-green-250 hover:no-underline mr-2"
                          href={
                            row?.description?.twitter &&
                            row?.description?.twitter?.includes('http')
                              ? row?.description?.twitter
                              : `https://twitter.com/${row?.description?.twitter}`
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
                      {row?.description?.discord && (
                        <a
                          className="text-green-500 dark:text-green-250 hover:no-underline mr-2"
                          href={
                            row?.description?.discord &&
                            row?.description?.discord?.includes('http')
                              ? row?.description?.discord
                              : `https://discord.com/invite/${row?.description?.discord}`
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
                            priority
                          />
                        </a>
                      )}
                      {row?.description?.github && (
                        <a
                          className="text-green-500 dark:text-green-250 hover:no-underline mr-2"
                          href={
                            row?.description?.github &&
                            row?.description?.github?.includes('http')
                              ? row?.description?.github
                              : `https://github.com/${row?.description?.github}`
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
                      {row?.description?.telegram && (
                        <a
                          className="text-green-500 dark:text-green-250 hover:no-underline mr-2"
                          href={
                            row?.description?.telegram &&
                            (row?.description?.telegram?.startsWith('http') ||
                              row?.description?.telegram?.startsWith('https'))
                              ? row?.description?.telegram
                              : `https://t.me/${row?.description?.telegram}`
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
                  ) : (
                    '-'
                  )}
                </div>
              </td>
              <td colSpan={7} className="px-4 pt-2 pb-4 align-top">
                <div className="flex flex-wrap text-xs text-left font-semibold text-nearblue-600 dark:text-neargray-10 tracking-wider py-2">
                  <div className="flex uppercase">Description</div>
                </div>
                <div className="flex flex-wrap text-xs text-left font-bold text-nearblue-600 dark:text-neargray-10 tracking-wider">
                  <div className="w-full">
                    <>
                      {row?.description?.description
                        ? row?.description?.description
                        : '-'}
                    </>
                  </div>
                </div>
              </td>
            </>
          )}
          {!row?.description && (
            <td colSpan={11} className="px-8">
              <div className="flex justify-center text-sm text-nearblue-600 dark:text-neargray-10 font-medium py-4 ">
                If you are node owner feel free to fill all&nbsp;
                <a
                  href="https://github.com/zavodil/near-pool-details#description"
                  className="text-green-500 dark:text-green-250 underline"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  data
                </a>
                &nbsp;to promote your own node!
              </div>
            </td>
          )}
        </tr>
      </>
    );
  };

  return (
    <div>
      <div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <div className="h-full bg-white  dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
              <div>
                <h2 className=" flex justify-between border-b dark:border-black-200 p-3 text-gray-600 dark:text-neargray-10 text-sm font-semibold">
                  <span>Staking Overview</span>
                </h2>
              </div>
              <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600 dark:text-neargray-10">
                <div className="flex items-center justify-between py-4">
                  <div className="w-full lg:w-1/4 mb-2 md:mb-0 ">
                    Current Validators
                  </div>
                  <div className="w-full lg:w-3/4 break-words">
                    {data?.currentValidators ? data?.currentValidators : ''}
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="w-full lg:w-1/4 mb-2 md:mb-0 ">
                    Total Staked
                  </div>
                  <div className="w-full lg:w-3/4 break-words">
                    {data?.totalStake && convertAmountToReadableString
                      ? convertAmountToReadableString(
                          data?.totalStake,
                          'totalStakeAmount',
                        )
                      : ''}
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="w-full lg:w-1/4 mb-2 md:mb-0 ">
                    Current Seat Price
                  </div>
                  <div className="w-full lg:w-3/4 break-words">
                    {
                      <>
                        {data?.epochStatsCheck
                          ? convertAmountToReadableString(
                              data?.epochStatsCheck,
                              'seatPriceAmount',
                            ) + ' Ⓝ'
                          : ''}
                      </>
                    }
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="w-full lg:w-1/4 mb-2 md:mb-0 ">
                    Total Supply
                  </div>
                  <div className="w-full lg:w-3/4 break-words">
                    {
                      <div className="relative">
                        <Tooltip
                          label={totalSupply?.stats[0].total_supply + ' yoctoⓃ'}
                          className="absolute top-0 left-1/2 h-auto max-w-xs bg-black bg-opacity-90 z-10 text-xs text-white px-3 py-2"
                        >
                          <button>
                            {TotalSupply ? formatNumber(TotalSupply) : ''}
                          </button>
                        </Tooltip>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="h-full bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-hidden">
              <h2 className="border-b dark:border-black-200 p-3 text-gray-600 dark:text-neargray-10 text-sm font-semibold">
                Epoch Information
              </h2>
              <div className="px-3 divide-y dark:divide-black-200 text-sm text-gray-600 dark:text-neargray-10">
                <div className="flex items-center justify-between py-4">
                  <div className="w-full lg:w-1/4 mb-2 md:mb-0 ">
                    Epoch Elapsed Time
                  </div>
                  <div className="w-full text-green-500 dark:text-green-250 lg:w-3/4 break-words">
                    {data?.elapsedTimeData &&
                    elapsedTime &&
                    convertTimestampToTime
                      ? convertTimestampToTime(elapsedTime.toString())
                      : ''}
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="w-full lg:w-1/4 mb-2 md:mb-0 ">
                    Next Epoch ETA
                  </div>
                  <div className="w-full lg:w-3/4 text-green-500 dark:text-green-250 break-words">
                    {data?.totalSeconds &&
                    timeRemaining &&
                    convertTimestampToTime
                      ? convertTimestampToTime(timeRemaining.toString())
                      : ''}
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="w-full lg:w-1/4 mb-2 md:mb-0 ">
                    Last Epoch APY
                  </div>
                  <div className="w-full lg:w-3/4 break-words">
                    {data?.lastEpochApy ? data?.lastEpochApy + '%' : '0'}
                  </div>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="w-full lg:w-1/4 mb-2 md:mb-0 ">Progress</div>
                  <div className="w-full lg:w-3/4 break-words">
                    {
                      <>
                        {data?.epochProgressData ? (
                          <div className="flex space-x-4 gap-2 items-center ">
                            <div className="bg-blue-900-15  h-2 w-full rounded-full">
                              <div
                                className="bg-green-500 dark:bg-green-250 h-2 rounded-full"
                                style={{
                                  width: `${
                                    data?.epochProgressData &&
                                    Big(data?.epochProgressData).toFixed(1)
                                  }%`,
                                }}
                              ></div>
                            </div>
                            {`${
                              data?.epochProgressData &&
                              Big(data?.epochProgressData).toFixed(0)
                            }%`}
                          </div>
                        ) : (
                          ''
                        )}
                      </>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-5"></div>
        <div className="w-full mb-10">
          <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl pb-1">
            <div className="flex flex-col pt-4">
              <div className="flex flex-col">
                <div className="leading-7 pl-3 px-3 text-sm mb-4 text-nearblue-600 dark:text-neargray-10">
                  {validatorEpochData &&
                    validatorEpochData.length > 0 &&
                    `${data?.total || 0}${' '}
                  Validators found`}
                </div>
              </div>
              <div className="flex flex-col">
                <Table
                  columns={columns}
                  data={validatorEpochData}
                  isPagination={true}
                  count={totalCount}
                  page={page}
                  limit={25}
                  pageLimit={999}
                  renderRowSubComponent={ExpandedRow}
                  setPage={setPage}
                  Error={error}
                  expanded={expanded}
                  ErrorText={
                    <ErrorMessage
                      icons={<FaInbox />}
                      message={errorMessage || ''}
                      mutedText="Please try again later"
                    />
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeList;
