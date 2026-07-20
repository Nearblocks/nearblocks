'use client';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Inbox,
  X,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

import { Link } from '@/components/link';
import {
  FilterClearData,
  FilterData,
  TableFilter,
} from '@/components/table-filter';
import { numberFormat } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/ui/button';
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

import { EmptyBox } from './empty';
import { SkeletonSlot } from './skeleton';

export type DataTableColumnDef<TData> = {
  cell: (row: TData) => ReactNode;
  cellClassName?: string;
  className?: string;
  csvLabel?: string;
  csvValue?: (row: TData) => number | string;
  enableFilter?: boolean;
  enableSort?: boolean;
  filterName?: string;
  filterPlaceholder?: string;
  header?: ((helpers: FilterHelpers) => ReactNode) | ReactNode;
  id?: string;
  skeletonCell?: ReactNode;
  skeletonWidth?: string;
  sortName?: string;
};

const csvEscape = (value: number | string) => {
  const str = String(value);
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export type FilterHelpers = {
  onClear: (data: FilterClearData) => void;
  onFilter: (value: FilterData) => void;
};

export type PaginationMeta = {
  next_page?: null | string;
  prev_page?: null | string;
};

type DataTableProps<TData> = {
  actions?: ReactNode;
  columns: DataTableColumnDef<TData>[];
  data?: null | TData[];
  defaultSort?: string;
  downloadFilename?: string;
  emptyIcon?: ReactNode;
  emptyMessage?: string;
  extraFilters?: Array<{ label: string; name: string; value: string }>;
  getRowKey?: (row: TData) => string;
  header?: ReactNode;
  loading?: boolean;
  onClear?: (data: FilterClearData) => void;
  onFilter?: (value: FilterData) => void;
  onPaginationNavigate?: (
    type: 'first' | 'next' | 'prev',
    cursor: string,
  ) => string;
  onSortNavigate?: (sort: string, order: 'asc' | 'desc') => string;
  // Query param that tracks the page number. Cursor-paginated tables use the
  // default client-side `p` counter; tables that paginate by a real server
  // page number (validator delegators) pass their own param, which is then
  // the source of truth for the label.
  pageParamKey?: string;
  // Whether a pager is plausible for this table's typical result set. When
  // false, loading skeletons stop reserving pager controls that would vanish
  // for single-page results. Defaults to reserving whenever the table is
  // paginatable at all.
  paginated?: boolean;
  pagination?: null | PaginationMeta;
  // Rows per page for the "Showing X to Y" range; the API paginates by
  // cursor so this mirrors the fetch limit (overridden by a `limit` param).
  perPage?: number;
  skeletonRows?: number;
  // Merged onto the table element, e.g. a wider min-width for dense tables.
  tableClassName?: string;
};

export const DataTable = <TData,>({
  actions,
  columns,
  data,
  defaultSort,
  downloadFilename,
  emptyIcon = <Inbox />,
  emptyMessage = 'No data found',
  extraFilters,
  getRowKey,
  header,
  loading = false,
  onClear,
  onFilter,
  onPaginationNavigate,
  onSortNavigate,
  pageParamKey = 'p',
  paginated,
  pagination,
  perPage = 25,
  skeletonRows = 25,
  tableClassName,
}: DataTableProps<TData>) => {
  const searchParams = useSearchParams();
  const reservePager = paginated ?? !!onPaginationNavigate;

  const csvColumns = columns.filter(
    (
      c,
    ): c is DataTableColumnDef<TData> & {
      csvLabel: string;
      csvValue: (row: TData) => number | string;
    } => !!c.csvLabel && !!c.csvValue,
  );
  const canDownload =
    !!downloadFilename &&
    csvColumns.length > 0 &&
    !!data &&
    data.length > 0 &&
    !loading;

  const onDownload = () => {
    if (!data || !downloadFilename) return;
    const header = csvColumns.map((c) => csvEscape(c.csvLabel)).join(',');
    const rows = data.map((row) =>
      csvColumns.map((c) => csvEscape(c.csvValue(row))).join(','),
    );
    downloadCsv(downloadFilename, [header, ...rows].join('\n'));
  };

  const hasPagination = !!pagination?.next_page || !!pagination?.prev_page;
  // The API paginates by cursor (no server page numbers), so track the page
  // client-side via a `p` query param: +1 on Next, -1 on Prev, cleared on
  // First. This also lets us clamp Prev/First on page 1 even when the API
  // still returns a prev cursor there.
  const hasCursorInUrl =
    !!searchParams.get('next') || !!searchParams.get('prev');
  const pageParam = searchParams.get(pageParamKey);
  const urlPage = Math.max(1, Number(pageParam ?? '1') || 1);
  const cursorMode = pageParamKey === 'p';
  // Cursor mode: a URL without a cursor is the canonical first page even if a
  // stale `p` survived a sort/filter round-trip; a cursor without `p` (legacy
  // or shared link) is an unknown depth, so don't claim a page number for it.
  const currentPage = cursorMode && !hasCursorInUrl ? 1 : urlPage;
  const pageUnknown = cursorMode && hasCursorInUrl && !pageParam;
  // Fetchers forward a user-settable `limit` (1-100) to the API; the Showing
  // range must count with the same page size the data was fetched with.
  const limitParam = Number(searchParams.get('limit'));
  const effPerPage =
    Number.isInteger(limitParam) && limitParam >= 1 && limitParam <= 100
      ? limitParam
      : perPage;

  const withPageParam = (href: string, page: null | number) => {
    const [path, query = ''] = href.split('?');
    const params = new URLSearchParams(query);
    if (page && page > 1) params.set(pageParamKey, String(page));
    else params.delete(pageParamKey);
    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  };

  // All three controls always render (disabled when unavailable) so buttons
  // keep stable positions across page changes instead of appearing/vanishing.
  const renderPagination = () => {
    const canPrev =
      !!pagination?.prev_page &&
      !!onPaginationNavigate &&
      (currentPage > 1 || hasCursorInUrl);
    const canNext = !!pagination?.next_page && !!onPaginationNavigate;
    const disabledClass = 'pointer-events-none opacity-50';

    return (
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              aria-disabled={!canPrev || undefined}
              className={canPrev ? undefined : disabledClass}
              href={
                canPrev
                  ? withPageParam(onPaginationNavigate!('first', ''), null)
                  : '#'
              }
              size="sm"
              tabIndex={canPrev ? undefined : -1}
            >
              First
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious
              aria-disabled={!canPrev || undefined}
              className={canPrev ? undefined : disabledClass}
              href={
                // Prev onto page 1 goes to the canonical cursor-less first
                // page, so Prev correctly disables there.
                canPrev
                  ? currentPage === 2
                    ? withPageParam(onPaginationNavigate!('first', ''), null)
                    : withPageParam(
                        onPaginationNavigate!('prev', pagination!.prev_page!),
                        currentPage - 1,
                      )
                  : '#'
              }
              size="sm"
              tabIndex={canPrev ? undefined : -1}
            />
          </PaginationItem>
          <PaginationItem>
            <span
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'pointer-events-none whitespace-nowrap opacity-50',
              )}
            >
              Page {pageUnknown ? '–' : currentPage}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              aria-disabled={!canNext || undefined}
              className={canNext ? undefined : disabledClass}
              href={
                canNext
                  ? withPageParam(
                      onPaginationNavigate!('next', pagination!.next_page!),
                      // From an unknown depth, stay unknown instead of
                      // claiming page 2.
                      pageUnknown ? null : currentPage + 1,
                    )
                  : '#'
              }
              size="sm"
              tabIndex={canNext ? undefined : -1}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Filters and sorts reset the data to the first page (cursors cleared), so
  // the page counter must reset with them or the label desyncs from the data.
  const pageReset = {
    next: undefined,
    [pageParamKey]: undefined,
    prev: undefined,
  };
  const filterHelpers: FilterHelpers = {
    onClear: (data) => (onClear || (() => {}))({ ...pageReset, ...data }),
    onFilter: (value) => (onFilter || (() => {}))({ ...pageReset, ...value }),
  };

  const activeFilters = [
    ...columns
      .filter(
        (col) =>
          col.enableFilter &&
          col.filterName &&
          searchParams.get(col.filterName),
      )
      .map((col) => ({
        label: typeof col.header === 'string' ? col.header : col.filterName!,
        name: col.filterName!,
        value: searchParams.get(col.filterName!)!,
      })),
    ...(extraFilters?.filter((f) => f.value) ?? []),
  ];

  const currentSort = searchParams.get('sort') ?? defaultSort ?? null;
  const currentOrder = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc';

  const renderHeader = (column: DataTableColumnDef<TData>) => {
    if (typeof column.header === 'function') {
      return column.header(filterHelpers);
    }

    if (column.enableSort && column.sortName && onSortNavigate) {
      const isActive = currentSort === column.sortName;
      const newOrder = isActive && currentOrder === 'desc' ? 'asc' : 'desc';
      const SortIcon = isActive
        ? currentOrder === 'asc'
          ? ArrowUp
          : ArrowDown
        : ArrowUpDown;

      return (
        <span className="flex items-center gap-1">
          {column.header}
          <Button asChild size="icon-xs" variant="ghost">
            <Link
              href={withPageParam(
                onSortNavigate(column.sortName, newOrder),
                null,
              )}
            >
              <SortIcon className="size-3" />
            </Link>
          </Button>
        </span>
      );
    }

    return column.header;
  };

  return (
    <>
      {(header ||
        activeFilters.length > 0 ||
        actions ||
        canDownload ||
        hasPagination ||
        (loading && (!!downloadFilename || reservePager))) && (
        <div className="text-body-sm flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <div className="leading-7">
            {header}
            {/* The Showing line renders on load for every paginatable table
                (even single-page ones), so its reservation keys off
                onPaginationNavigate, not the pager reservation. */}
            {loading && !!onPaginationNavigate && (
              <span className="text-body-xs block leading-5">
                <Skeleton className="w-28" />
              </span>
            )}
            {!loading &&
              !!onPaginationNavigate &&
              !!data?.length &&
              !pageUnknown && (
                <span className="text-body-xs text-muted-foreground/80 block leading-5">
                  (Showing {numberFormat((currentPage - 1) * effPerPage + 1)} to{' '}
                  {numberFormat((currentPage - 1) * effPerPage + data.length)})
                </span>
              )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Filters are URL-derived, so the chips are fully known during
                loading — rendering them in both states keeps the bar's wrap
                geometry identical when data arrives. */}
            {activeFilters.length > 0 && (
              <>
                <span className="text-muted-foreground shrink-0">
                  Filtered By:
                </span>
                {activeFilters.map((filter) => (
                  <Button
                    key={filter.name}
                    // Route through filterHelpers so clearing a chip also
                    // resets the cursors and page counter with the filter.
                    onClick={() =>
                      filterHelpers.onClear({ [filter.name]: undefined })
                    }
                    size="xs"
                    variant="outline"
                  >
                    <span className="font-medium">{filter.label}:</span>
                    <span className="max-w-20 truncate">{filter.value}</span>
                    <X className="size-3" />
                  </Button>
                ))}
              </>
            )}
            {/* Loading placeholders mirror what this table renders when
                loaded: an xs action button, the sm download button, and the
                four pagination controls — so the bar keeps its height AND its
                wrap threshold; widths match the controls that replace them. */}
            {loading
              ? actions && (
                  <span className="flex h-7 items-center">
                    <Skeleton className="w-24" />
                  </span>
                )
              : actions}
            {loading && !!downloadFilename && (
              <span className="hidden h-8 items-center sm:flex">
                <Skeleton className="w-41" />
              </span>
            )}
            {loading && reservePager && (
              <span className="flex h-8 items-center gap-2">
                <Skeleton className="w-12" />
                <Skeleton className="w-17" />
                <Skeleton className="w-16" />
                <Skeleton className="w-17" />
              </span>
            )}
            {canDownload && (
              <Button
                className="hidden sm:inline-flex"
                onClick={onDownload}
                size="sm"
                title="Download visible rows as CSV"
                variant="outline"
              >
                <Download className="size-3.5" />
                Download Page Data
              </Button>
            )}
            {!loading && hasPagination && renderPagination()}
          </div>
        </div>
      )}
      {/* Fixed layout sizes columns from the header row only, so skeleton
          and loaded states get identical column widths — no reflow when
          data arrives. Cells already truncate. */}
      <Table className={cn('min-w-4xl table-fixed', tableClassName)}>
        <TableHeader className="uppercase">
          <TableRow>
            {columns.map((column, index) => (
              <TableHead className={column.className} key={column.id || index}>
                {column.enableFilter && column.filterName ? (
                  <span className="flex items-center gap-1">
                    {renderHeader(column)}{' '}
                    <TableFilter
                      name={column.filterName}
                      onClear={filterHelpers.onClear}
                      onFilter={filterHelpers.onFilter}
                      placeholder={column.filterPlaceholder}
                    />
                  </span>
                ) : (
                  renderHeader(column)
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <SkeletonSlot
          fallback={
            <TableBody>
              {[...Array(skeletonRows)].map((_, i) => (
                <TableRow className="h-15" key={i}>
                  {columns.map((column, j) => (
                    <TableCell
                      className={cn('truncate px-3', column.cellClassName)}
                      key={column.id ?? j}
                    >
                      {column.skeletonCell ?? (
                        <Skeleton
                          className={cn('w-[60%]', column.skeletonWidth)}
                        />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          }
          loading={loading}
        >
          {() => (
            <TableBody>
              {data?.map((row, rowIndex) => {
                const key = getRowKey ? getRowKey(row) : String(rowIndex);
                return (
                  <TableRow className="h-15" key={key}>
                    {columns.map((column, colIndex) => (
                      <TableCell
                        className={cn('truncate px-3', column.cellClassName)}
                        key={column.id || colIndex}
                      >
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          )}
        </SkeletonSlot>
      </Table>
      {!loading && data?.length === 0 && (
        <EmptyBox description={emptyMessage} icon={emptyIcon} />
      )}
      <SkeletonSlot
        fallback={
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
        }
        // Only reserve a footer pager when one is plausible for this table's
        // typical result set (see the `paginated` prop) — a reserved footer
        // that vanishes for single-page results is itself a layout shift.
        loading={loading && reservePager}
      >
        {() => (
          <>
            {hasPagination && (
              <div className="flex items-center justify-end border-t p-4 py-3">
                {renderPagination()}
              </div>
            )}
          </>
        )}
      </SkeletonSlot>
    </>
  );
};
