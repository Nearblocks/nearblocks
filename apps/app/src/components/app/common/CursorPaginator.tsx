'use client';
import { useSearchParams } from 'next/navigation';

import { useIntlRouter, usePathname } from '@/i18n/routing';
import { formatWithCommas } from '@/utils/libs';
interface PaginatorProps {
  apiUrl?: string;
  cursor: string | undefined;
  isLoading?: boolean;
}
const CursorPaginator = (props: PaginatorProps) => {
  const { cursor, isLoading } = props;
  const intlRouter = useIntlRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams?.get('page') || '1';

  const handleNextPage = () => {
    if (cursor) {
      const currentUrl = new URL(window?.location.href);
      const params = new URLSearchParams(currentUrl?.search);
      params.set('page', String(Number(page) + 1));
      params.set('cursor', `${cursor}`);
      const newUrl = `${pathname}?${params?.toString()}`;
      intlRouter.push(newUrl, { scroll: false });
    }
  };

  const onFirst = () => {
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);

    params.delete('cursor');
    params.delete('page');
    const newUrl = `${pathname}?${params.toString()}`;
    intlRouter.replace(newUrl, { scroll: false });
  };

  return (
    <>
      <div className="bg-white dark:bg-black-600 px-2 py-3 flex items-center justify-between border-t dark:border-black-200 md:px-4 rounded-b-xl">
        <div className="flex-1 flex items-center justify-between">
          <div></div>
          <div
            aria-label="Pagination"
            className="relative z-0 inline-flex rounded-md"
          >
            <button
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2  text-xs font-medium rounded-md ${
                page === '1' || isLoading
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:bg-green-400 dark:hover:bg-green-250 hover:text-white dark:hover:text-black'
              } bg-gray-100 dark:bg-black-200 dark:text-green-250`}
              disabled={page === '1' || isLoading}
              onClick={onFirst}
              type="button"
            >
              First
            </button>
            <button
              className="relative inline-flex items-center px-2 ml-1 md:px-3 py-2 text-xs font-medium text-gray-500  rounded-md  bg-gray-100 dark:bg-black-200 dark:text-neargray-10"
              disabled
              type="button"
            >
              {`Page ${formatWithCommas(String(page))}`}
            </button>
            <button
              className={`relative inline-flex items-center ml-1 px-2 md:px-3 py-2 rounded-md font-medium text-xs ${
                props.isLoading || !props.cursor
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:text-white dark:hover:text-black hover:bg-green-400 dark:hover:bg-green-250'
              }  bg-gray-100 dark:text-green-250 dark:bg-black-200`}
              disabled={isLoading || !cursor}
              onClick={handleNextPage}
              type="button"
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
