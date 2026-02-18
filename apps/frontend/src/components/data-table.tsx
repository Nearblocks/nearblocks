'use client';

import { Inbox, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

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
  enableFilter?: boolean;
  filterName?: string;
  header?: ((helpers: FilterHelpers) => ReactNode) | ReactNode;
  id?: string;
  skeletonWidth?: string;
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
  columns: DataTableColumnDef<TData>[];
  data?: null | TData[];
  emptyIcon?: ReactNode;
  emptyMessage?: string;
  getRowKey?: (row: TData) => string;
  header?: ReactNode;
  loading?: boolean;
  onClear?: (data: FilterClearData) => void;
  onFilter?: (value: FilterData) => void;
  onPaginationNavigate?: (type: 'next' | 'prev', cursor: string) => string;
  pagination?: null | PaginationMeta;
  skeletonRows?: number;
};

export function DataTable<TData>({
  columns,
  data,
  emptyIcon = <Inbox />,
  emptyMessage = 'No data found',
  getRowKey,
  header,
  loading = false,
  onClear,
  onFilter,
  onPaginationNavigate,
  pagination,
  skeletonRows = 25,
}: DataTableProps<TData>) {
  const searchParams = useSearchParams();

  const filterHelpers: FilterHelpers = {
    onClear: onClear || (() => {}),
    onFilter: onFilter || (() => {}),
  };

  const activeFilters = columns
    .filter(
      (col) =>
        col.enableFilter && col.filterName && searchParams.get(col.filterName),
    )
    .map((col) => ({
      label: typeof col.header === 'string' ? col.header : col.filterName!,
      name: col.filterName!,
      value: searchParams.get(col.filterName!)!,
    }));

  const renderHeader = (column: DataTableColumnDef<TData>) => {
    if (typeof column.header === 'function') {
      return column.header(filterHelpers);
    }
    return column.header;
  };

  return (
    <>
      {(header || activeFilters.length > 0) && (
        <div className="text-body-sm flex flex-wrap items-center justify-between gap-1 border-b px-4 py-3">
          <div className="leading-7">{header}</div>
          {activeFilters.length > 0 && !loading && (
            <div className="flex flex-wrap items-center gap-2">
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
            </div>
          )}
        </div>
      )}
      <Table className="xl:table-fixed">
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
                    <TableCell key={column.id ?? j}>
                      <Skeleton
                        className={cn('w-[60%]', column.skeletonWidth)}
                      />
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
      {data?.length === 0 && (
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
            {(pagination?.next_page || pagination?.prev_page) && (
              <div className="flex items-center border-t p-4 py-3">
                <Pagination className="justify-end">
                  <PaginationContent>
                    {pagination?.prev_page && onPaginationNavigate && (
                      <PaginationItem>
                        <PaginationPrevious
                          href={onPaginationNavigate(
                            'prev',
                            pagination.prev_page,
                          )}
                          size="sm"
                        />
                      </PaginationItem>
                    )}
                    {pagination?.next_page && onPaginationNavigate && (
                      <PaginationItem>
                        <PaginationNext
                          href={onPaginationNavigate(
                            'next',
                            pagination.next_page,
                          )}
                          size="sm"
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </SkeletonSlot>
    </>
  );
}
