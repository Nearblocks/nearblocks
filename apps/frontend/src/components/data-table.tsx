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
import { cn } from '@/lib/utils';
import { Button } from '@/ui/button';
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
  pagination?: null | PaginationMeta;
  skeletonRows?: number;
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
  pagination,
  skeletonRows = 25,
}: DataTableProps<TData>) => {
  const searchParams = useSearchParams();

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
  const renderPagination = () => (
    <Pagination className="mx-0 w-auto">
      <PaginationContent>
        {pagination?.prev_page && onPaginationNavigate && (
          <PaginationItem>
            <PaginationLink href={onPaginationNavigate('first', '')} size="sm">
              First
            </PaginationLink>
          </PaginationItem>
        )}
        {pagination?.prev_page && onPaginationNavigate && (
          <PaginationItem>
            <PaginationPrevious
              href={onPaginationNavigate('prev', pagination.prev_page)}
              size="sm"
            />
          </PaginationItem>
        )}
        {pagination?.next_page && onPaginationNavigate && (
          <PaginationItem>
            <PaginationNext
              href={onPaginationNavigate('next', pagination.next_page)}
              size="sm"
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );

  const filterHelpers: FilterHelpers = {
    onClear: (data) =>
      (onClear || (() => {}))({ next: undefined, prev: undefined, ...data }),
    onFilter: (value) =>
      (onFilter || (() => {}))({ next: undefined, prev: undefined, ...value }),
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
            <Link href={onSortNavigate(column.sortName, newOrder)}>
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
        hasPagination) && (
        <div className="text-body-sm flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
          <div className="leading-7">{header}</div>
          <div className="flex flex-wrap items-center gap-2">
            {activeFilters.length > 0 && !loading && (
              <>
                <span className="text-muted-foreground shrink-0">
                  Filtered By:
                </span>
                {activeFilters.map((filter) => (
                  <Button
                    key={filter.name}
                    onClick={() => onClear?.({ [filter.name]: undefined })}
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
            {loading ? <Skeleton className="h-7 w-40" /> : actions}
            {canDownload && (
              <Button
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
      <Table>
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
                <PaginationItem>
                  <Skeleton className="h-8 w-17.5" />
                </PaginationItem>
                <PaginationItem>
                  <Skeleton className="h-8 w-17.5" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        }
        loading={loading}
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
