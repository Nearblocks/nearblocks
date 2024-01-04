import Paginator from '@/includes/Common/Paginator';
import Skeleton from '@/includes/Common/Skeleton';
/**
 * @param {boolean} isLoading - Represents the loading state of the data.
 * @param {Array} columns - An array of objects defining the columns for the table.
 * @param {Array} data - An array of rows containing data for the table.
 * @param {boolean} isPagination - Indicates if pagination is enabled for the table.
 * @param {number} count - The total count of items in the dataset.
 * @param {number} page - The current page number being displayed.
 * @param {number} limit - The number of items per page.
 * @param {string} Error - Error message if there is no data.
 * @param {number} pageLimit - The maximum number of pages to display in pagination.
 * @param {function} setPage - A function used to set the current page of the table.
 */
interface column {
  header: string;
  key: string;
  cell?: (row: any, rowIndex?: number) => React.ReactNode;
  tdClassName: string;
  thClassName?: string;
}

interface Props {
  isLoading?: boolean;
  columns: column[];
  data: any[];
  isPagination: boolean;
  count: number;
  page: number;
  limit: number;
  pageLimit: number;
  setPage: (page: number) => void;
  Error: string;
}

export default function (props: Props) {
  if (props.isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y border-t">
          <thead className="bg-gray-100 h-[51px]">
            <tr>
              {props.columns.map((column, index) => (
                <th key={index} scope="col" className={column.thClassName}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(50)].map((_, index) => (
              <tr key={index} className=" hover:bg-blue-900/5 h-[53px]">
                {props.columns.map((column, colIndex) => (
                  <td key={colIndex} className={column.tdClassName}>
                    <Skeleton className="h-4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <>
      <div className="overflow-x-auto ">
        <table className="min-w-full divide-y border-t">
          <thead className="bg-gray-100 h-[51px]">
            <tr>
              {props?.columns.map((column: column, index: number) => (
                <th key={index} scope="col" className={column.thClassName}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!props.isLoading && props.data.length === 0 && (
              <tr className="h-[53px]">
                <td className="px-6 py-4 text-gray-400 text-xs">
                  {props.Error}
                </td>
              </tr>
            )}
            {props.data &&
              props.data.map((row, rowIndex: number) => (
                <tr key={rowIndex} className=" hover:bg-blue-900/5 h-[53px]">
                  {props.columns.map((column: column, colIndex: number) => (
                    <td key={colIndex} className={column.tdClassName}>
                      {column.cell
                        ? column.cell(row, rowIndex)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {props.isPagination ? (
        <Paginator
          loading={props?.isLoading}
          count={props.count}
          page={props.page}
          limit={props.limit}
          pageLimit={props.pageLimit}
          setPage={props.setPage}
        />
      ) : null}
    </>
  );
}
