'use client';

import { ReactNode } from 'react';
import { LuInbox } from 'react-icons/lu';

import {
  FilterClearData,
  FilterData,
  TableFilter,
} from '@/components/table-filter';
import { cn } from '@/lib/utils';
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
  emptyIcon = <LuInbox />,
  emptyMessage = 'No data found',
  getRowKey,
  loading = false,
  onClear,
  onFilter,
  onPaginationNavigate,
  pagination,
  skeletonRows = 25,
}: DataTableProps<TData>) {
  const filterHelpers: FilterHelpers = {
    onClear: onClear || (() => {}),
    onFilter: onFilter || (() => {}),
  };

  const renderHeader = (column: DataTableColumnDef<TData>) => {
    if (typeof column.header === 'function') {
      return column.header(filterHelpers);
    }
    return column.header;
  };

  return (
    <>
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
                        className="truncate px-3"
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
                  <Skeleton className="h-8 w-[70px]" />
                </PaginationItem>
                <PaginationItem>
                  <Skeleton className="h-8 w-[70px]" />
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
