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
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import type { Validator, ValidatorsListRes } from 'nb-schemas';

import { useLocale } from '@/hooks/use-locale';
import { nearFormat, numberFormat } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { buttonVariants } from '@/ui/button';
import { Card, CardContent } from '@/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/ui/pagination';
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
  const pathname = usePathname();
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

  // Client-side page counter, mirroring the DataTable pager semantics: a
  // cursor-less URL is the canonical first page even if a stale `p` survived
  // a round-trip; a cursor without `p` (legacy or shared link) is an unknown
  // depth, so don't claim a page number for it.
  const hasCursorInUrl =
    !!searchParams.get('next') || !!searchParams.get('prev');
  const pageParam = searchParams.get('p');
  const urlPage = Math.max(1, Number(pageParam ?? '1') || 1);
  const currentPage = hasCursorInUrl ? urlPage : 1;
  const pageUnknown = hasCursorInUrl && !pageParam;

  const isFirstPage = !hasCursorInUrl;
  const hasPrev = !!meta?.prev_page && !isFirstPage;
  const hasNext = !!meta?.next_page;

  const buildHref = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const firstHref = buildHref((params) => {
    params.delete('next');
    params.delete('prev');
    params.delete('p');
  });

  // Prev onto page 1 goes to the canonical cursor-less first page, so Prev
  // correctly disables there — but only when the depth is actually known to
  // be 2; from an unknown depth Prev must follow the prev cursor.
  const prevHref =
    currentPage === 2
      ? firstHref
      : buildHref((params) => {
          if (meta?.prev_page) params.set('prev', meta.prev_page);
          params.delete('next');
          if (!pageUnknown && currentPage - 1 > 1) {
            params.set('p', String(currentPage - 1));
          } else {
            params.delete('p');
          }
        });

  const nextHref = buildHref((params) => {
    if (meta?.next_page) params.set('next', meta.next_page);
    params.delete('prev');
    // From an unknown depth, stay unknown instead of claiming page 2.
    if (pageUnknown) params.delete('p');
    else params.set('p', String(currentPage + 1));
  });

  const disabledClass = 'pointer-events-none opacity-50';

  return (
    <Card>
      <CardContent className="p-0">
        <div className="text-body-sm border-b px-4 py-3 leading-7">
          {loading ? (
            <Skeleton className="w-40" />
          ) : total != null ? (
            t('table.total', { count: numberFormat(total) })
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-[1200px] table-fixed">
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
                <TableHead className="w-32">
                  {t('table.columns.totalStake')}
                </TableHead>
                <TableHead className="w-24">
                  {t('table.columns.stakePercent')}
                </TableHead>
                <TableHead className="w-48">
                  {t('table.columns.cumulativeStake')}
                </TableHead>
                <TableHead className="w-36">
                  {t('table.columns.stakeChange')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 25 }).flatMap((_, i) => {
                    const rows = [
                      <TableRow className="h-15" key={i}>
                        {[
                          'w-[60%]',
                          'w-[60%]',
                          'h-4.5 w-12.5 rounded-md',
                          // The validator column stacks the account link over
                          // the pubkey line, so its skeleton mirrors that
                          // two-line geometry to keep row heights equal.
                          null,
                          'w-[60%]',
                          'w-[60%]',
                          'w-[60%]',
                          'w-[60%]',
                          'w-[60%]',
                          'w-[60%]',
                          'w-[60%]',
                        ].map((width, j) => (
                          <TableCell key={j}>
                            {width ? (
                              <Skeleton className={width} />
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                {/* Line 1 is a text-body-sm line box (22px);
                                    line 2 matches the h-5 Copy-button row —
                                    22 + 2 + 20 + py-3 = the loaded 68px. */}
                                <Skeleton className="w-40" />
                                <span className="flex h-5 items-center">
                                  <Skeleton className="w-32" />
                                </span>
                              </div>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>,
                    ];
                    // The first page carries the decentralization warning row
                    // after the cumulative-33% validator (usually within the
                    // first handful of rows), so reserve one placeholder row
                    // with identical geometry instead of popping it in.
                    if (isFirstPage && i === 8) {
                      rows.push(
                        <TableRow key="decentralization-warning">
                          <TableCell className="py-3 text-center" colSpan={11}>
                            <Skeleton className="w-[60%]" />
                          </TableCell>
                        </TableRow>,
                      );
                    }
                    return rows;
                  })
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
                            className="text-body-sm py-3 text-center whitespace-normal text-amber-500"
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
        {/* Loading placeholders mirror the four controls the loaded pager
            renders (First / Prev / page label / Next), matching the
            DataTable convention so the bar keeps its geometry. */}
        {loading && (
          <div className="flex items-center border-t p-4 py-3">
            <Pagination className="justify-end">
              <PaginationContent>
                <PaginationItem className="flex h-8 items-center">
                  <Skeleton className="w-12" />
                </PaginationItem>
                <PaginationItem className="flex h-8 items-center">
                  <Skeleton className="w-17" />
                </PaginationItem>
                <PaginationItem className="flex h-8 items-center">
                  <Skeleton className="w-16" />
                </PaginationItem>
                <PaginationItem className="flex h-8 items-center">
                  <Skeleton className="w-17" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        {!loading && (hasPrev || hasNext || !isFirstPage) && (
          <div className="flex items-center justify-end border-t p-4 py-3">
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink
                    aria-disabled={!hasPrev || undefined}
                    className={hasPrev ? undefined : disabledClass}
                    href={hasPrev ? firstHref : '#'}
                    size="sm"
                    tabIndex={hasPrev ? undefined : -1}
                  >
                    {t('table.first')}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationPrevious
                    aria-disabled={!hasPrev || undefined}
                    className={hasPrev ? undefined : disabledClass}
                    href={hasPrev ? prevHref : '#'}
                    size="sm"
                    tabIndex={hasPrev ? undefined : -1}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span
                    className={cn(
                      buttonVariants({ size: 'sm', variant: 'outline' }),
                      'pointer-events-none whitespace-nowrap opacity-50',
                    )}
                  >
                    {t('table.page', {
                      page: pageUnknown ? '–' : currentPage,
                    })}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    aria-disabled={!hasNext || undefined}
                    className={hasNext ? undefined : disabledClass}
                    href={hasNext ? nextHref : '#'}
                    size="sm"
                    tabIndex={hasNext ? undefined : -1}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
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
            <span className="text-muted-foreground">—</span>
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
          <div className="dark:bg-muted relative h-7 w-40 overflow-hidden rounded-full bg-[#d1d5db]">
            <div
              className="bg-link absolute inset-y-0 left-0"
              style={{
                width: `${row.cumulative_stake_percent ?? 0}%`,
              }}
            />
            <span className="text-body-xs text-white-950 absolute inset-0 flex items-center justify-center font-medium">
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
