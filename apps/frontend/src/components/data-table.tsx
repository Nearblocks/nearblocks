/**
 * DataTable - A reusable, composable data table component
 *
 * Features:
 * - Type-safe column definitions
 * - Built-in loading states with skeleton UI
 * - Pagination support
 * - Column filtering
 * - Empty state handling
 * - Customizable headers and cells
 *
 * @example
 * ```tsx
 * type User = { id: string; name: string; email: string };
 *
 * const columns: DataTableColumnDef<User>[] = [
 *   {
 *     id: 'name',
 *     header: 'Name',
 *     cell: (user) => <span>{user.name}</span>,
 *   },
 *   {
 *     id: 'email',
 *     header: 'Email',
 *     enableFilter: true,
 *     filterName: 'email',
 *     cell: (user) => <span>{user.email}</span>,
 *   },
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={users}
 *   loading={isLoading}
 *   header={<>Total: {totalCount} users</>}
 *   pagination={meta}
 *   onPaginationNavigate={(type, page) => `/users?${type}=${page}`}
 *   getRowKey={(user) => user.id}
 * />
 * ```
 */
'use client';

import { ReactNode } from 'react';
import { LuInbox } from 'react-icons/lu';

import {
  FilterClearData,
  FilterData,
  TableFilter,
} from '@/components/table-filter';
import { Badge } from '@/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/ui/card';
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

// Column definition types
export type DataTableColumnDef<TData> = {
  cell: (row: TData) => ReactNode;
  className?: string;
  enableFilter?: boolean;
  filterName?: string;
  header?: ((helpers: FilterHelpers) => ReactNode) | ReactNode;
  id?: string;
};

export type FilterHelpers = {
  onClear: (data: FilterClearData) => void;
  onFilter: (value: FilterData) => void;
};

export type PaginationMeta = {
  next_page?: null | string;
  prev_page?: null | string;
};

// Props for the DataTable component
type DataTableProps<TData> = {
  className?: string;
  columns: DataTableColumnDef<TData>[];
  data?: null | TData[];
  emptyIcon?: ReactNode;
  emptyMessage?: string;
  getRowKey?: (row: TData) => string;
  header?: ReactNode;
  loading?: boolean;
  onClear?: (data: FilterClearData) => void;
  onFilter?: (value: FilterData) => void;
  onPaginationNavigate?: (type: 'next' | 'prev', page: string) => string;
  pagination?: null | PaginationMeta;
  skeletonRows?: number;
};

export function DataTable<TData>({
  className,
  columns,
  data,
  emptyIcon = <LuInbox />,
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
    <Card className={className}>
      {header && (
        <CardHeader className="text-body-sm border-b py-3">
          <SkeletonSlot
            fallback={<Skeleton className="w-40" />}
            loading={loading}
          >
            {() => header}
          </SkeletonSlot>
        </CardHeader>
      )}
      <CardContent className="text-body-sm p-0">
        <Table>
          <TableHeader className="uppercase">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  className={column.className}
                  key={column.id || index}
                >
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
                  <TableRow className="h-13.5" key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="w-[60%]" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            }
            loading={loading || !data}
          >
            {() => (
              <TableBody>
                {data?.map((row, rowIndex) => {
                  const key = getRowKey ? getRowKey(row) : String(rowIndex);
                  return (
                    <TableRow className="h-13.5" key={key}>
                      {columns.map((column, colIndex) => (
                        <TableCell key={column.id || colIndex}>
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
      </CardContent>

      <SkeletonSlot
        fallback={
          <CardFooter className="border-t py-3">
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
          </CardFooter>
        }
        loading={loading || !pagination}
      >
        {() => (
          <>
            {(pagination?.next_page || pagination?.prev_page) && (
              <CardFooter className="border-t py-3">
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
              </CardFooter>
            )}
          </>
        )}
      </SkeletonSlot>
    </Card>
  );
}

// Export helper components for common patterns
export { Badge };
