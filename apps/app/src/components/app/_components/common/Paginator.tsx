import FaChevronLeft from '../Icons/FaChevronLeft';
import FaChevronRight from '../Icons/FaChevronRight';
interface PaginatorProps {
  count: number;
  page: number;
  limit: number;
  pageLimit: number;
  setPage?: (page: number) => void;
  isLoading?: boolean;
}
// Simulated absence of the translation function
const t = (key: string, p?: any): any => {
  p = {};
  const simulateAbsence = true; // Set to true to simulate absence of t
  return simulateAbsence ? undefined : { key, p }; // Return undefined to simulate absence
};
const Paginator = (props: PaginatorProps) => {
  let pages: number;
  const {
    page,
    count,
    limit,
    isLoading = false,
    setPage = () => {},
    pageLimit = 200,
  } = props;
  if (count > 0) {
    pages = Math.ceil(count / limit);
  } else {
    pages = 1;
  }
  pages = pages > pageLimit ? pageLimit : pages;
  const onPrev = () => {
    if (page <= 1) return null;
    const newPage = (page || 1) - 1;
    setPage(newPage);
    return;
  };
  const onNext = () => {
    if (page >= pages) return null;
    const newPage = (page || 1) + 1;
    setPage(newPage);
    return;
  };
  const onFirst = () => setPage(1);
  const onLast = () => setPage(pages);
  return (
    <div className="bg-white dark:bg-black-600 px-2 py-3 flex items-center justify-between border-t dark:border-black-200 md:px-4 rounded-b-xl">
      <div className="flex-1 flex items-center justify-between">
        <div></div>
        <div>
          <div
            className="relative z-0 inline-flex rounded-md"
            aria-label="Pagination"
          >
            <button
              type="button"
              disabled={page <= 1 || pages === 1 || isLoading}
              onClick={onFirst}
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2  text-xs font-medium rounded-md ${
                page <= 1 || isLoading
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:bg-green-400 dark:hover:bg-green-250 hover:text-white dark:hover:text-black'
              } bg-gray-100 dark:bg-black-200 dark:text-green-250`}
            >
              {t('pagination.first') || 'First'}
            </button>
            <button
              type="button"
              disabled={page <= 1 || pages === 1 || isLoading}
              onClick={onPrev}
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2 font-medium ${
                page <= 1 || isLoading
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:text-white dark:hover:text-black hover:bg-green-400 dark:hover:bg-green-250'
              } rounded-md  bg-gray-100 dark:bg-black-200`}
            >
              <FaChevronLeft />
            </button>
            <button
              type="button"
              disabled
              className="relative inline-flex items-center px-2 ml-1 md:px-3 py-2 text-xs font-medium text-gray-500  rounded-md  bg-gray-100 dark:bg-black-200 dark:text-neargray-10"
            >
              Page {page} of {pages}
            </button>
            <button
              type="button"
              disabled={page >= pages || pages === 1 || isLoading}
              onClick={onNext}
              className={`relative inline-flex items-center ml-1 px-2 md:px-3 py-2 rounded-md font-medium ${
                page >= pages || isLoading
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:text-white dark:hover:text-black hover:bg-green-400 dark:hover:bg-green-250'
              }  bg-gray-100 dark:text-green-250 dark:bg-black-200`}
            >
              <FaChevronRight />
            </button>
            <button
              type="button"
              disabled={page >= pages || pages === 1 || isLoading}
              onClick={onLast}
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2 text-xs font-medium rounded-md ${
                page >= pages || isLoading
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:text-white dark:hover:text-black hover:bg-green-400 dark:hover:bg-green-250'
              }  bg-gray-100 dark:text-green-250 dark:bg-black-200`}
            >
              {t('pagination.last') || 'Last'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Paginator;
