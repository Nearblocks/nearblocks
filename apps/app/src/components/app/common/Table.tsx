import { Fragment } from 'react';
import Paginator from './Paginator';
import CursorPaginator from './CursorPaginator';
interface column {
  header: string | JSX.Element;
  key: string;
  cell?: (row: any, rowIndex?: number) => React.ReactNode;
  tdClassName: string;
  thClassName?: string;
}
interface Props {
  isLoading?: boolean;
  countLoading?: boolean;
  columns: column[];
  data: any[];
  isPagination?: boolean;
  count?: any;
  page: number;
  limit: number;
  pageLimit?: number;
  setPage?: (page: number) => void;
  renderRowSubComponent?: (row: any, rowIndex?: number) => React.ReactNode;
  expanded?: number[];
  isExpanded?: false;
  Error?: string | any;
  ErrorText?: string | any;
  cursorPagination?: boolean;
  cursor?: string;
  apiUrl?: string;
  setUrl?: (url: string) => void;
  url?: string;
  ownerId?: string;
}
const Table = (props: Props) => {
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
                  <th key={index} scope="col" className={column?.thClassName}>
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
                      colSpan={100}
                      className="px-6 py-4 text-gray-400 text-xs"
                    >
                      {props?.ErrorText}
                    </td>
                  </tr>
                )}
              {props?.data &&
                props?.data.map((row, rowIndex: number) => (
                  <Fragment key={rowIndex}>
                    <tr key={`expandRow-${rowIndex}`} className="h-[57px]">
                      {props?.columns.map(
                        (column: column, colIndex: number) => (
                          <td
                            key={`expandCol-${colIndex}`}
                            className={column?.tdClassName}
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
                        key={`expandWarning-${rowIndex}`}
                        className="h-[25px] hover:bg-blue-900/5"
                      >
                        <td
                          colSpan={props?.columns?.length}
                          className="px-5 py-2 whitespace-nowrap text-center text-sm text-yellow-500 font-medium"
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
        <div className="overflow-x-auto ">
          <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
            <thead className="bg-gray-100 dark:bg-black-300 h-[51px]">
              <tr>
                {props?.columns &&
                  props?.columns.map((column: column, index: number) => (
                    <th key={index} scope="col" className={column?.thClassName}>
                      {column?.header}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black-600 divide-y dark:divide-black-200 divide-gray-200">
              {!props?.isLoading &&
                (props?.Error || props?.data?.length === 0 || undefined) && (
                  <tr className="h-[57px]">
                    <td
                      colSpan={100}
                      className="px-6 py-4 text-gray-400 text-xs"
                    >
                      {props?.ErrorText}
                    </td>
                  </tr>
                )}
              {props?.data &&
                props?.data.map((row, rowIndex: number) => (
                  <Fragment key={rowIndex}>
                    <tr
                      key={`row-${rowIndex}`}
                      className="hover:bg-blue-900/5 h-[57px]"
                    >
                      {props?.columns?.map(
                        (column: column, colIndex: number) => (
                          <td
                            key={`col-${colIndex}`}
                            className={column?.tdClassName}
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
                        key={`warning-${rowIndex}`}
                        className="h-[25px] hover:bg-blue-900/5"
                      >
                        <td
                          colSpan={props.columns.length}
                          className="px-5 py-4  whitespace-nowrap text-sm text-center text-yellow-500 font-medium"
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
      )}
      {props?.isPagination &&
      !props?.Error &&
      props?.data?.length !== 0 &&
      props?.page &&
      props?.pageLimit ? (
        <Paginator
          count={props?.count}
          isLoading={props?.countLoading}
          page={props?.page}
          limit={props?.limit}
          pageLimit={props?.pageLimit}
        />
      ) : null}
      {props?.cursorPagination && !props?.Error && props?.data?.length !== 0 ? (
        <CursorPaginator
          apiUrl={props?.apiUrl}
          cursor={props?.cursor}
          isLoading={props?.isLoading}
        />
      ) : null}
    </>
  );
};
export default Table;
