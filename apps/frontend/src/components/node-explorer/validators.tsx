'use client';

import { RiGithubFill, RiTwitterXFill } from '@remixicon/react';
import {
  ChevronDown,
  ChevronUp,
  Globe,
  Mail,
  MessageCircle,
  Send,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import type { ValidatorEpochData } from 'nb-types';

import type { ValidatorsRes } from '@/data/node-explorer';
import { nearFormat, numberFormat } from '@/lib/format';
import { Badge } from '@/ui/badge';
import { Card, CardContent } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';

import { AccountLink } from '../link';
import { Truncate, TruncateCopy, TruncateText } from '../truncate';

const PAGE_SIZE = 25;

const statusLabel = (status: string) => {
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
      return 'Idle';
    case 'newcomer':
      return 'Newcomer';
    case 'onHold':
      return 'On Hold';
    default:
      return status;
  }
};

const statusVariant = (
  status: string,
): 'amber' | 'blue' | 'gray' | 'lime' | 'red' => {
  switch (status) {
    case 'active':
      return 'lime';
    case 'joining':
    case 'proposal':
    case 'newcomer':
      return 'amber';
    case 'leaving':
      return 'red';
    case 'onHold':
      return 'blue';
    default:
      return 'gray';
  }
};

type Props = {
  latestBlockHeight?: number;
  loading?: boolean;
  validators?: null | ValidatorsRes;
};

export const ValidatorsTable = ({
  latestBlockHeight = 0,
  loading,
  validators,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page') ?? '1');
  const [expanded, setExpanded] = useState<number[]>([]);

  const toggleRow = (index: number) =>
    setExpanded((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );

  const pageData: ValidatorEpochData[] = validators?.validatorFullData ?? [];
  const totalPages = Math.ceil((validators?.total ?? 0) / PAGE_SIZE);

  const warningIndex = !loading
    ? pageData.findIndex(
        (v) =>
          v.cumulativeStake &&
          Number(v.cumulativeStake.cumulativePercent) >= 33,
      )
    : -1;

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="text-body-sm border-b px-4 py-3 leading-7">
          {loading ? (
            <Skeleton className="h-4 w-40 align-middle" />
          ) : pageData.length > 0 ? (
            `${numberFormat(validators?.total ?? 0)} Validators found`
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="uppercase">
              <TableRow>
                <TableHead className="w-14" />
                <TableHead className="w-16">Location</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-56">Validator</TableHead>
                <TableHead className="w-16">Fee</TableHead>
                <TableHead className="w-16">APY</TableHead>
                <TableHead className="w-28">Delegators</TableHead>
                <TableHead className="whitespace-nowrap">Total Stake</TableHead>
                <TableHead className="whitespace-nowrap">Stake %</TableHead>
                <TableHead className="w-44 whitespace-nowrap">
                  Cumulative Stake
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  Stake Change (24H)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 25 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 11 }).map((__, j) => (
                        <TableCell className="h-22.5" key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : pageData.flatMap((row, localIdx) => {
                    const globalIdx = (page - 1) * PAGE_SIZE + localIdx;
                    const rows = [
                      <ValidatorRows
                        expanded={expanded}
                        key={row.accountId}
                        lastBlockHeight={latestBlockHeight}
                        lastEpochApy={validators?.lastEpochApy ?? '0'}
                        row={row}
                        telemetry={
                          validators?.validatorTelemetry?.[row.accountId] ??
                          null
                        }
                        toggleRow={toggleRow}
                      />,
                    ];
                    if (warningIndex >= 0 && globalIdx === warningIndex) {
                      rows.push(
                        <TableRow key="decentralization-warning">
                          <TableCell
                            className="text-body-sm py-3 text-center text-amber-500"
                            colSpan={11}
                          >
                            Validators 1–
                            {(page - 1) * PAGE_SIZE + warningIndex + 1} hold a
                            cumulative stake above 33%. Delegating to the
                            validators below improves the decentralization of
                            the network.
                          </TableCell>
                        </TableRow>,
                      );
                    }
                    return rows;
                  })}
            </TableBody>
          </Table>
        </div>
        {!loading && totalPages > 1 && (
          <div className="text-body-sm flex items-center justify-end gap-2 border-t px-4 py-3">
            <button
              className="rounded border px-3 py-1 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => updatePage(page - 1)}
            >
              Prev
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              className="rounded border px-3 py-1 disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => updatePage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

type ValidatorRowsProps = {
  expanded: number[];
  lastBlockHeight: number;
  lastEpochApy: string;
  row: ValidatorEpochData;
  telemetry: {
    agentBuild?: string;
    agentName?: string;
    agentVersion?: string;
    lastHeight?: number;
    lastSeen?: number;
    status?: string;
  } | null;
  toggleRow: (index: number) => void;
};

const ValidatorRows = ({
  expanded,
  lastBlockHeight,
  lastEpochApy,
  row,
  telemetry,
  toggleRow,
}: ValidatorRowsProps) => {
  const idx = row.index ?? 0;
  const isExpanded = expanded.includes(idx);

  const stake =
    row.currentEpoch?.stake ??
    row.nextEpoch?.stake ??
    row.afterNextEpoch?.stake ??
    row.contractStake;

  const fee = row.poolInfo?.fee ?? null;
  const feeDisplay = fee
    ? `${((fee.numerator / fee.denominator) * 100).toFixed(0)}%`
    : 'N/A';

  const apyNum =
    fee && lastEpochApy
      ? Number(lastEpochApy) -
        Number(lastEpochApy) * (fee.numerator / fee.denominator)
      : null;
  const apyDisplay =
    apyNum !== null ? (apyNum === 0 ? '0%' : `${apyNum.toFixed(2)}%`) : 'N/A';

  const progress = row.currentEpoch?.progress;
  const productivityRatio = progress
    ? (progress.blocks.produced + progress.chunks.produced) /
      (progress.blocks.total + progress.chunks.total)
    : 0;

  const lastHeightColor =
    telemetry?.lastHeight && lastBlockHeight
      ? Math.abs(telemetry.lastHeight - lastBlockHeight) > 1000
        ? 'text-red-500'
        : Math.abs(telemetry.lastHeight - lastBlockHeight) > 50
        ? 'text-amber-500'
        : ''
      : '';

  const timeAgoFromMs = (ms: number) => {
    const diff = Date.now() - ms;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const socialMedia =
    row.description?.twitter ||
    row.description?.discord ||
    row.description?.github ||
    row.description?.telegram;

  return (
    <>
      <TableRow>
        <TableCell>
          <button
            className="flex items-center justify-center p-1"
            onClick={() => toggleRow(idx)}
          >
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>
        </TableCell>
        <TableCell>
          {row.description?.country_code ? (
            <Image
              alt={row.description.country ?? 'location'}
              height={20}
              src={`https://flagcdn.com/48x36/${row.description.country_code.toLowerCase()}.png`}
              title={row.description.country}
              unoptimized
              width={20}
            />
          ) : (
            <div className="bg-muted text-muted-foreground text-body-xs flex size-5 items-center justify-center rounded-sm">
              ?
            </div>
          )}
        </TableCell>
        <TableCell>
          <Badge variant={statusVariant(row.stakingStatus ?? '')}>
            {statusLabel(row.stakingStatus ?? '')}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-0.5">
            <AccountLink
              account={row.accountId}
              textClassName="text-body-sm max-w-40"
            />
            {row.publicKey && (
              <Truncate>
                <TruncateText
                  className="text-body-xs max-w-40 px-2"
                  text={row.publicKey}
                ></TruncateText>
                <TruncateCopy text={row.publicKey} />
              </Truncate>
            )}
          </div>
        </TableCell>
        <TableCell>{feeDisplay}</TableCell>
        <TableCell>{apyDisplay}</TableCell>
        <TableCell>
          {row.poolInfo?.delegatorsCount !== undefined &&
          row.poolInfo?.delegatorsCount !== null
            ? numberFormat(row.poolInfo.delegatorsCount)
            : 'N/A'}
        </TableCell>
        <TableCell className="whitespace-nowrap">
          {stake ? `${nearFormat(stake, { maximumFractionDigits: 0 })} Ⓝ` : ''}
        </TableCell>
        <TableCell>{row.percent ? `${row.percent}%` : ''}</TableCell>
        <TableCell>
          <div className="bg-muted relative h-7 w-36 overflow-hidden rounded-xl">
            <div
              className="bg-link absolute inset-0 h-full"
              style={{
                width: `${row.cumulativeStake?.cumulativePercent ?? 0}%`,
              }}
            />
            <span className="text-body-xs absolute inset-0 flex items-center justify-center font-medium text-white">
              {row.cumulativeStake?.cumulativePercent
                ? `${row.cumulativeStake.cumulativePercent}%`
                : 'N/A'}
            </span>
          </div>
        </TableCell>
        <TableCell>
          {row.stakeChange?.value ? (
            <span
              className={
                row.stakeChange.symbol === '+'
                  ? 'text-lime-foreground'
                  : 'text-red-foreground'
              }
            >
              {row.stakeChange.symbol}
              {row.stakeChange.value} Ⓝ
            </span>
          ) : stake ? (
            <span className="text-muted-foreground">
              {nearFormat(stake, { maximumFractionDigits: 0 })} Ⓝ
            </span>
          ) : null}
        </TableCell>
      </TableRow>

      {isExpanded && (
        <>
          {telemetry && (
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableCell className="py-2 pl-8 align-top" colSpan={2}>
                <div className="text-muted-foreground text-headline-xs uppercase">
                  Uptime
                </div>
                <div className="text-body-xs mt-1">
                  {!isNaN(productivityRatio)
                    ? `${
                        productivityRatio * 100 === 100
                          ? 100
                          : (productivityRatio * 100).toFixed(3)
                      }%`
                    : '-'}
                </div>
              </TableCell>
              <TableCell className="py-2 align-top" colSpan={2}>
                <div className="text-muted-foreground text-headline-xs uppercase">
                  Latest Block
                </div>
                <div className={`text-body-xs mt-1 ${lastHeightColor}`}>
                  {telemetry.lastHeight ?? '-'}
                </div>
              </TableCell>
              <TableCell className="py-2 align-top" colSpan={3}>
                <div className="text-muted-foreground text-headline-xs uppercase">
                  Latest Telemetry Update
                </div>
                <div className="text-body-xs mt-1">
                  {telemetry.lastSeen ? timeAgoFromMs(telemetry.lastSeen) : '-'}
                </div>
              </TableCell>
              <TableCell className="py-2 align-top" colSpan={2}>
                <div className="text-muted-foreground text-headline-xs uppercase">
                  Node Agent Name
                </div>
                <div className="text-body-xs mt-1">
                  {telemetry.agentName ? (
                    <span className="bg-muted rounded px-1 py-0.5">
                      {telemetry.agentName}
                    </span>
                  ) : (
                    '-'
                  )}
                </div>
              </TableCell>
              <TableCell className="py-2 align-top" colSpan={2}>
                <div className="text-muted-foreground text-headline-xs uppercase">
                  Node Agent Version / Build
                </div>
                <div className="text-body-xs mt-1">
                  {telemetry.agentVersion || telemetry.agentBuild ? (
                    <span className="bg-muted rounded px-1 py-0.5">
                      {telemetry.agentVersion}/{telemetry.agentBuild}
                    </span>
                  ) : (
                    '-'
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}

          {row.description ? (
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableCell
                className="p-3 align-top whitespace-normal"
                colSpan={3}
              >
                <div className="text-muted-foreground text-headline-xs uppercase">
                  Name
                </div>
                <div className="text-body-sm mt-2">
                  {row.description.name ?? '-'}
                </div>
              </TableCell>
              <TableCell
                className="p-3 align-top whitespace-normal"
                colSpan={1}
              >
                <div className="text-muted-foreground text-headline-xs uppercase">
                  Social Media
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {socialMedia ? (
                    <>
                      {row.description.url && (
                        <a
                          href={
                            row.description.url.startsWith('http')
                              ? row.description.url
                              : `http://${row.description.url}`
                          }
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          <Globe className="text-link size-4" />
                        </a>
                      )}
                      {row.description.email && (
                        <a
                          href={`mailto:${row.description.email}`}
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          <Mail className="text-link size-4" />
                        </a>
                      )}
                      {row.description.twitter && (
                        <a
                          href={
                            row.description.twitter.includes('http')
                              ? row.description.twitter
                              : `https://twitter.com/${row.description.twitter}`
                          }
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          <RiTwitterXFill className="text-link size-4" />
                        </a>
                      )}
                      {row.description.discord && (
                        <a
                          href={
                            row.description.discord.includes('http')
                              ? row.description.discord
                              : `https://discord.com/invite/${row.description.discord}`
                          }
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          <MessageCircle className="text-link size-4" />
                        </a>
                      )}
                      {row.description.github && (
                        <a
                          href={
                            row.description.github.includes('http')
                              ? row.description.github
                              : `https://github.com/${row.description.github}`
                          }
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          <RiGithubFill className="text-link size-4" />
                        </a>
                      )}
                      {row.description.telegram && (
                        <a
                          href={
                            row.description.telegram.startsWith('http')
                              ? row.description.telegram
                              : `https://t.me/${row.description.telegram}`
                          }
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          <Send className="text-link size-4" />
                        </a>
                      )}
                    </>
                  ) : (
                    '-'
                  )}
                </div>
              </TableCell>
              <TableCell
                className="p-3 align-top whitespace-normal"
                colSpan={7}
              >
                <div className="text-muted-foreground text-headline-xs uppercase">
                  Description
                </div>
                <div className="text-body-sm mt-2">
                  {row.description.description ?? '-'}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableCell
                className="text-muted-foreground text-body-sm py-4 text-center"
                colSpan={11}
              >
                If you are a node owner, feel free to fill in all{' '}
                <a
                  className="text-green-500 underline dark:text-green-400"
                  href="https://github.com/zavodil/near-pool-details#description"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  data
                </a>{' '}
                to promote your own node!
              </TableCell>
            </TableRow>
          )}
        </>
      )}
    </>
  );
};
