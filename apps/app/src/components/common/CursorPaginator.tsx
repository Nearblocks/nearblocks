import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import { useIntlRouter, usePathname } from '@/i18n/routing';
import { formatWithCommas } from '@/utils/libs';
interface PaginatorProps {
  cursor: string | undefined;
  page: number;
  setPage: (page: number) => void;
}

const CursorPaginator = (props: PaginatorProps) => {
  const router = useRouter();
  const intlRouter = useIntlRouter();
  const { id, locale, ...rest } = router.query;
  const { cursor, setPage } = props;
  const [loading, setLoading] = useState(false);
  const actualPath = usePathname();
  const page = rest.p || 1;

  useEffect(() => {
    const handleRouteChangeComplete = () => {
      setLoading(false);
      const { p } = router.query;
      const newPage = p ? parseInt(p as string, 10) : 1;
      if (newPage !== page) {
        setPage(newPage);
      }
    };
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [page, router, setPage]);

  const initialLoad = useRef(true);

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      const {
        query: { cursor, locale, p, ...updatedQuery },
      } = router;

      if (p) {
        // @ts-ignore: Unreachable code error
        intlRouter.replace({
          pathname: actualPath,
          query: updatedQuery,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleNextPage = () => {
    if (loading) return;

    setLoading(true);
    setPage(Number(page) + 1);
    const updatedQuery = {
      ...rest,
      cursor: cursor || '',
      p: Number(page) + 1,
    };
    // @ts-ignore: Unreachable code error
    intlRouter.push({ pathname: actualPath, query: updatedQuery });
  };

  const onFirst = () => {
    const { cursor, p, ...updatedQuery } = rest;
    setPage(1);
    // @ts-ignore: Unreachable code error
    intlRouter.push({ pathname: actualPath, query: updatedQuery });
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
                page === 1 || loading
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:bg-green-400 dark:hover:bg-green-250 hover:text-white dark:hover:text-black'
              } bg-gray-100 dark:bg-black-200 dark:text-green-250`}
              disabled={page === 1 || loading}
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
                !props.cursor || loading
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:text-white dark:hover:text-black hover:bg-green-400 dark:hover:bg-green-250'
              }  bg-gray-100 dark:text-green-250 dark:bg-black-200`}
              disabled={!cursor || loading}
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
