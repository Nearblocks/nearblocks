import { Fragment, type JSX } from 'react';

import Skeleton from '@/components/app/skeleton/common/Skeleton';
import CursorPaginator from '@/components/app/common/CursorPaginator';
import Paginator from '@/components/app/common/Paginator';
interface column {
  cell?: (row: any, rowIndex?: number) => React.ReactNode;
  header: JSX.Element | string;
  key: string;
  tdClassName: string;
  thClassName?: string;
}
interface Props {
  columns: column[];
  count?: any;
  countLoading?: boolean;
  cursor?: string;
  cursorPagination?: boolean;
  data?: any;
  Error?: any | string;
  ErrorText?: any | string;
  expanded?: number[];
  isExpanded?: false;
  isLoading?: boolean;
  isPagination?: boolean;
  limit: number;
  ownerId?: string;
  page?: number;
  pageLimit?: number;
  renderRowSubComponent?: (row: any, rowIndex?: number) => React.ReactNode;
  setPage?: (page: number) => void;
  setUrl?: (url: string) => void;
  url?: string;
}
const Table = (props: Props) => {
  if (props.isLoading) {
    return (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
            <thead className="bg-gray-100 dark:bg-black-300 h-[51px]">
              <tr>
                {props?.columns &&
                  props?.columns?.map((column, index) => (
                    <th className={column.thClassName} key={index} scope="col">
                      {column.header}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
              {[...Array(props?.limit)]?.map((_, index) => (
                <tr className=" hover:bg-blue-900/5 h-[57px]" key={index}>
                  {props?.columns?.map((column, colIndex) => (
                    <td className={column?.tdClassName} key={colIndex}>
                      <Skeleton className="h-4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {props.isPagination && props.pageLimit ? (
          <Paginator
            count={props.count as number}
            limit={props.limit}
            pageLimit={props.pageLimit}
          />
        ) : null}
        {props.cursorPagination && props.page && props.setPage ? (
          <CursorPaginator cursor={props.cursor} />
        ) : null}
      </>
    );
  }
  return (
    <>
      {props?.isExpanded ? (
        <div className={`bg-gray-50 dark:bg-black-600 overflow-x-auto`}>
          <table
            className={
              'min-w-full divide-y dark:divide-black-200 dark:border-black border-separate '
            }
          >
            <thead>
              <tr>
                {props?.columns?.map((column: column, index: number) => (
                  <th className={column?.thClassName} key={index} scope="col">
                    {column?.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!props?.isLoading &&
                (props?.Error || props?.data?.length === 0) && (
                  <tr className="h-[57px]">
                    <td
                      className="px-6 py-4 text-gray-400 text-xs"
                      colSpan={100}
                    >
                      {props?.ErrorText}
                    </td>
                  </tr>
                )}
              {props?.data &&
                props?.data.map((row: any, rowIndex: number) => (
                  <Fragment key={rowIndex}>
                    <tr className="h-[57px]" key={`expandRow-${rowIndex}`}>
                      {props?.columns.map(
                        (column: column, colIndex: number) => (
                          <td
                            className={column?.tdClassName}
                            key={`expandCol-${colIndex}`}
                          >
                            {column?.cell
                              ? column?.cell(row, rowIndex)
                              : row[column?.key]}
                          </td>
                        ),
                      )}
                    </tr>
                    {row?.showWarning && (
                      <tr
                        className="h-[25px] hover:bg-blue-900/5"
                        key={`expandWarning-${rowIndex}`}
                      >
                        <td
                          className="px-5 py-2 whitespace-nowrap text-center text-sm text-yellow-500 font-medium"
                          colSpan={props?.columns?.length}
                        >
                          {row?.warning}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
              <thead className="bg-gray-100 dark:bg-black-300 h-[51px]">
                <tr>
                  {props?.columns &&
                    props?.columns.map((column: column, index: number) => (
                      <th
                        className={column?.thClassName}
                        key={index}
                        scope="col"
                      >
                        {column?.header}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-black-600 divide-y dark:divide-black-200 divide-gray-200">
                {props?.data &&
                  props?.data.length > 0 &&
                  props?.data.map((row: any, rowIndex: number) => (
                    <Fragment key={rowIndex}>
                      <tr
                        className="hover:bg-blue-900/5 h-[57px]"
                        key={`row-${rowIndex}`}
                      >
                        {props?.columns?.map(
                          (column: column, colIndex: number) => (
                            <td
                              className={column?.tdClassName}
                              key={`col-${colIndex}`}
                            >
                              {column?.cell
                                ? column?.cell(row, rowIndex)
                                : row[column?.key]}
                            </td>
                          ),
                        )}
                      </tr>
                      {row?.isExpanded ||
                      (props?.expanded &&
                        props?.expanded.length > 0 &&
                        props?.expanded.includes(row?.index))
                        ? props?.renderRowSubComponent &&
                          props?.renderRowSubComponent(row)
                        : null}
                      {row?.showWarning && (
                        <tr
                          className="h-[25px] hover:bg-blue-900/5"
                          key={`warning-${rowIndex}`}
                        >
                          <td
                            className="px-5 py-4 whitespace-nowrap text-sm text-center text-yellow-500 font-medium"
                            colSpan={props?.columns?.length}
                          >
                            {row?.warning}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
              </tbody>
            </table>
          </div>
          {!props?.isLoading &&
            (props?.Error || props?.data?.length === 0 || undefined) && (
              <div className="relative min-h-[400px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">{props?.ErrorText}</div>
                </div>
              </div>
            )}
        </>
      )}
      {props?.isPagination &&
      !props?.Error &&
      props?.data?.length !== 0 &&
      props?.pageLimit ? (
        <Paginator
          count={props?.count}
          isLoading={props?.countLoading}
          limit={props?.limit}
          page={props?.page}
          pageLimit={props?.pageLimit}
        />
      ) : null}
      {props?.cursorPagination && !props?.Error && props?.data?.length !== 0 ? (
        <CursorPaginator cursor={props?.cursor} isLoading={props?.isLoading} />
      ) : null}
    </>
  );
};
export default Table;
