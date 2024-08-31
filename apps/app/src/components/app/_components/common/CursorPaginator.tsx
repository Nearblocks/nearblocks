'use client';
import { formatWithCommas } from '@/utils/libs';
import { useRouter } from 'next/navigation';
interface PaginatorProps {
  apiUrl: string;
  page: number;
  setPage: (page: number) => void;
  // setUrl: (url: string) => void;
  cursor: string | undefined;
  isLoading?: boolean;
}
const CursorPaginator = (props: PaginatorProps) => {
  const { setPage, page, cursor, isLoading } = props;

  const router = useRouter();

  const handleNextPage = () => {
    console.log({ cursor });
    // Get the current URL and search parameters
    if (cursor) {
      const currentUrl = new URL(window?.location.href);
      const params = new URLSearchParams(currentUrl?.search);

      // Set or update the cursor parameter
      params.set('cursor', `${cursor}`);

      // Construct the new URL with updated search parameters
      const newUrl = `${currentUrl?.pathname}?${params?.toString()}`;

      // Update the URL in the browser
      router.push(newUrl);

      // Update the page state
      setPage(page + 1);
    }
  };

  const onFirst = () => {
    // Get the current URL and search parameters
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);

    // Remove the cursor parameter
    params.delete('cursor');

    // Construct the new URL without the cursor parameter
    const newUrl = `${currentUrl.pathname}?${params.toString()}`;

    // Update the URL in the browser
    router.replace(newUrl);

    // Update the API URL and reset the page state
    // setUrl(props.apiUrl);
    setPage(1);
  };

  return (
    <>
      <div className="bg-white dark:bg-black-600 px-2 py-3 flex items-center justify-between border-t dark:border-black-200 md:px-4 rounded-b-xl">
        <div className="flex-1 flex items-center justify-between">
          <div></div>
          <div
            className="relative z-0 inline-flex rounded-md"
            aria-label="Pagination"
          >
            <button
              type="button"
              disabled={page === 1 || isLoading}
              onClick={onFirst}
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2  text-xs font-medium rounded-md ${
                page === 1 || isLoading
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:bg-green-400 dark:hover:bg-green-250 hover:text-white dark:hover:text-black'
              } bg-gray-100 dark:bg-black-200 dark:text-green-250`}
            >
              First
            </button>
            <button
              type="button"
              disabled
              className="relative inline-flex items-center px-2 ml-1 md:px-3 py-2 text-xs font-medium text-gray-500  rounded-md  bg-gray-100 dark:bg-black-200 dark:text-neargray-10"
            >
              {`Page ${formatWithCommas(String(page))}`}
            </button>
            <button
              type="button"
              disabled={isLoading || !cursor}
              onClick={handleNextPage}
              className={`relative inline-flex items-center ml-1 px-2 md:px-3 py-2 rounded-md font-medium text-xs ${
                props.isLoading || !props.cursor
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:text-white dark:hover:text-black hover:bg-green-400 dark:hover:bg-green-250'
              }  bg-gray-100 dark:text-green-250 dark:bg-black-200`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default CursorPaginator;
