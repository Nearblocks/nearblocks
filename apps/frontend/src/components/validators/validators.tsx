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

import type { Validator, ValidatorsListRes } from 'nb-schemas';

import { useLocale } from '@/hooks/use-locale';
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

import { Copy } from '../copy';
import { Link } from '../link';
import { Truncate, TruncateCopy, TruncateText } from '../truncate';

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
  lastEpochApy?: null | string;
  loading?: boolean;
  meta?: ValidatorsListRes['meta'];
  networkHolderIndex?: null | number;
  total?: null | number;
  validators?: null | Validator[];
};

export const ValidatorsTable = ({
  lastEpochApy,
  loading,
  meta,
  networkHolderIndex,
  total,
  validators,
}: Props) => {
  const { t } = useLocale('validators');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggleRow = (accountId: string) =>
    setExpanded((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId],
    );

  const pageData: Validator[] = validators ?? [];

  const warningIndex = !loading
    ? pageData.findIndex((v) => v.is_network_holder_warning === true)
    : -1;

  const onNext = () => {
    if (!meta?.next_page) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('next', meta.next_page);
    params.delete('prev');
    router.push(`?${params.toString()}`);
  };

  const onPrev = () => {
    if (!meta?.prev_page) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('prev', meta.prev_page);
    params.delete('next');
    router.push(`?${params.toString()}`);
  };

  const onFirst = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('next');
    params.delete('prev');
    router.push(`?${params.toString()}`);
  };

  const hasPrev = !!meta?.prev_page;
  const hasNext = !!meta?.next_page;
  const isFirstPage = !searchParams.get('next') && !searchParams.get('prev');

  return (
    <Card>
      <CardContent className="p-0">
        <div className="text-body-sm border-b px-4 py-3 leading-7">
          {loading ? (
            <Skeleton className="h-4 w-40 align-middle" />
          ) : total != null ? (
            t('table.total', { count: numberFormat(total) })
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="uppercase">
              <TableRow>
                <TableHead className="w-14" />
                <TableHead className="w-16">
                  {t('table.columns.location')}
                </TableHead>
                <TableHead className="w-24">
                  {t('table.columns.status')}
                </TableHead>
                <TableHead className="w-56">
                  {t('table.columns.validator')}
                </TableHead>
                <TableHead className="w-16">{t('table.columns.fee')}</TableHead>
                <TableHead className="w-16">{t('table.columns.apy')}</TableHead>
                <TableHead className="w-28">
                  {t('table.columns.delegators')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('table.columns.totalStake')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('table.columns.stakePercent')}
                </TableHead>
                <TableHead className="w-44 whitespace-nowrap">
                  {t('table.columns.cumulativeStake')}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {t('table.columns.stakeChange')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 25 }).map((_, i) => (
                    <TableRow className="h-15" key={i}>
                      {Array.from({ length: 11 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : pageData.flatMap((row, localIdx) => {
                    const rows = [
                      <ValidatorRows
                        expanded={expanded}
                        key={row.account_id}
                        lastEpochApy={lastEpochApy ?? '0'}
                        row={row}
                        toggleRow={toggleRow}
                      />,
                    ];
                    if (warningIndex >= 0 && localIdx === warningIndex) {
                      rows.push(
                        <TableRow key="decentralization-warning">
                          <TableCell
                            className="text-body-sm py-3 text-center text-amber-500"
                            colSpan={11}
                          >
                            {t('table.warning', {
                              index: networkHolderIndex
                                ? networkHolderIndex + 1
                                : localIdx + 1,
                            })}
                          </TableCell>
                        </TableRow>,
                      );
                    }
                    return rows;
                  })}
            </TableBody>
          </Table>
        </div>
        {!loading && (hasPrev || hasNext || !isFirstPage) && (
          <div className="text-body-sm flex items-center justify-end gap-2 border-t px-4 py-3">
            {!isFirstPage && (
              <button
                className="rounded border px-3 py-1 disabled:opacity-40"
                onClick={onFirst}
              >
                {t('table.first')}
              </button>
            )}
            <button
              className="rounded border px-3 py-1 disabled:opacity-40"
              disabled={!hasPrev}
              onClick={onPrev}
            >
              {t('table.prev')}
            </button>
            <button
              className="rounded border px-3 py-1 disabled:opacity-40"
              disabled={!hasNext}
              onClick={onNext}
            >
              {t('table.next')}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

type ValidatorRowsProps = {
  expanded: string[];
  lastEpochApy: string;
  row: Validator;
  toggleRow: (accountId: string) => void;
};

const ValidatorRows = ({
  expanded,
  lastEpochApy,
  row,
  toggleRow,
}: ValidatorRowsProps) => {
  const { t } = useLocale('validators');
  const isExpanded = expanded.includes(row.account_id);

  const stake =
    row.current_epoch_stake ??
    row.next_epoch_stake ??
    row.after_next_epoch_stake ??
    row.contract_stake;

  const feeDisplay =
    row.fee_numerator != null && row.fee_denominator != null
      ? `${((row.fee_numerator / row.fee_denominator) * 100).toFixed(0)}%`
      : 'N/A';

  const apyNum =
    row.fee_numerator != null && row.fee_denominator != null && lastEpochApy
      ? Number(lastEpochApy) -
        Number(lastEpochApy) * (row.fee_numerator / row.fee_denominator)
      : null;
  const apyDisplay =
    apyNum !== null ? (apyNum === 0 ? '0%' : `${apyNum.toFixed(2)}%`) : 'N/A';

  const statusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('table.statuses.active');
      case 'joining':
        return t('table.statuses.joining');
      case 'leaving':
        return t('table.statuses.kickout');
      case 'proposal':
        return t('table.statuses.proposal');
      case 'idle':
        return t('table.statuses.idle');
      case 'newcomer':
        return t('table.statuses.newcomer');
      case 'onHold':
        return t('table.statuses.onHold');
      default:
        return status;
    }
  };

  const socialMedia = row.twitter || row.discord || row.github || row.telegram;

  const cumulativeLabel = row.cumulative_stake_percent
    ? `${row.cumulative_stake_percent}%`
    : 'N/A';

  return (
    <>
      <TableRow className="h-15">
        <TableCell>
          <button
            className="flex items-center justify-center p-1"
            onClick={() => toggleRow(row.account_id)}
          >
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>
        </TableCell>
        <TableCell>
          {row.country_code ? (
            <Image
              alt={row.country ?? 'location'}
              height={20}
              src={`https://flagcdn.com/48x36/${row.country_code.toLowerCase()}.png`}
              title={row.country ?? undefined}
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
          <Badge
            className="text-body-xs px-1.5 py-0.5"
            variant={statusVariant(row.staking_status ?? '')}
          >
            {statusLabel(row.staking_status ?? '')}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1">
              <Link
                className="text-body-sm text-link"
                href={`/validators/${row.account_id}`}
              >
                <Truncate>
                  <TruncateText className="max-w-50" text={row.account_id} />
                </Truncate>
              </Link>
              <Copy
                className="text-muted-foreground h-5"
                size="icon-xs"
                text={row.account_id}
              />
            </span>
            {row.public_key && (
              <Truncate>
                <TruncateText
                  className="text-body-xs max-w-40"
                  text={row.public_key}
                />
                <TruncateCopy className="h-5" text={row.public_key} />
              </Truncate>
            )}
          </div>
        </TableCell>
        <TableCell>{feeDisplay}</TableCell>
        <TableCell>{apyDisplay}</TableCell>
        <TableCell>
          {row.delegators_count != null
            ? numberFormat(row.delegators_count)
            : 'N/A'}
        </TableCell>
        <TableCell className="whitespace-nowrap">
          {stake ? `${nearFormat(stake, { maximumFractionDigits: 0 })} Ⓝ` : ''}
        </TableCell>
        <TableCell>
          {row.own_stake_percent ? `${row.own_stake_percent}%` : ''}
        </TableCell>
        <TableCell>
          <div className="bg-muted relative h-7 w-40 overflow-hidden rounded-full">
            <div
              className="bg-link absolute inset-y-0 left-0"
              style={{
                width: `${row.cumulative_stake_percent ?? 0}%`,
              }}
            />
            <span className="text-body-xs absolute inset-0 flex items-center justify-center font-medium text-white">
              {cumulativeLabel}
            </span>
          </div>
        </TableCell>
        <TableCell>
          {row.stake_change_value ? (
            <span
              className={
                row.stake_change_symbol === '+'
                  ? 'text-lime-foreground'
                  : 'text-red-foreground'
              }
            >
              {row.stake_change_symbol}
              {row.stake_change_value} Ⓝ
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
          {row.name ||
          row.description ||
          row.url ||
          row.email ||
          socialMedia ? (
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableCell
                className="pt-2 pb-4 pl-8 align-top whitespace-normal"
                colSpan={3}
              >
                <div className="text-muted-foreground text-headline-xs uppercase">
                  {t('table.expanded.name')}
                </div>
                <div className="text-body-sm mt-2 flex items-center gap-1.5">
                  {row.logo && row.logo.startsWith('http') && (
                    <Image
                      alt={row.name ?? 'logo'}
                      className="rounded-sm"
                      height={20}
                      src={row.logo}
                      unoptimized
                      width={20}
                    />
                  )}
                  <span>{row.name ?? '-'}</span>
                </div>
              </TableCell>
              <TableCell
                className="p-3 align-top whitespace-normal"
                colSpan={1}
              >
                <div className="text-muted-foreground text-headline-xs uppercase">
                  {t('table.expanded.socialMedia')}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  {socialMedia || row.url || row.email ? (
                    <>
                      {row.url && (
                        <a
                          href={
                            row.url.startsWith('http')
                              ? row.url
                              : `http://${row.url}`
                          }
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          <Globe className="text-link size-4" />
                        </a>
                      )}
                      {row.email && (
                        <a
                          href={`mailto:${row.email}`}
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          <Mail className="text-link size-4" />
                        </a>
                      )}
                      {row.twitter && (
                        <a
                          href={
                            row.twitter.includes('http')
                              ? row.twitter
                              : `https://twitter.com/${row.twitter}`
                          }
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          <RiTwitterXFill className="text-link size-4" />
                        </a>
                      )}
                      {row.discord && (
                        <a
                          href={
                            row.discord.includes('http')
                              ? row.discord
                              : `https://discord.com/invite/${row.discord}`
                          }
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          <MessageCircle className="text-link size-4" />
                        </a>
                      )}
                      {row.github && (
                        <a
                          href={
                            row.github.includes('http')
                              ? row.github
                              : `https://github.com/${row.github}`
                          }
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          <RiGithubFill className="text-link size-4" />
                        </a>
                      )}
                      {row.telegram && (
                        <a
                          href={
                            row.telegram.startsWith('http')
                              ? row.telegram
                              : `https://t.me/${row.telegram}`
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
                  {t('table.expanded.description')}
                </div>
                <div className="text-body-sm mt-2">
                  {row.description ?? '-'}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableCell
                className="text-muted-foreground text-body-sm py-4 text-center"
                colSpan={11}
              >
                {t('table.expanded.ownerPre')}{' '}
                <a
                  className="text-green-500 underline dark:text-green-400"
                  href="https://github.com/zavodil/near-pool-details#description"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  data
                </a>{' '}
                {t('table.expanded.ownerPost')}
              </TableCell>
            </TableRow>
          )}
        </>
      )}
    </>
  );
};
