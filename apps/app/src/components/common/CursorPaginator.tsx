import { formatWithCommas } from '@/utils/libs';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
interface PaginatorProps {
  page: number;
  setPage: (page: number) => void;
  cursor: string | undefined;
}

const CursorPaginator = (props: PaginatorProps) => {
  const router = useRouter();
  const { setPage, page, cursor } = props;
  const [loading, setLoading] = useState(false);

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
        pathname,
        query: { cursor, p, ...updatedQuery },
      } = router;

      if (cursor && p) {
        router.replace({
          pathname: pathname,
          query: updatedQuery,
        });
      }
    }
  }, [router]);

  const handleNextPage = () => {
    if (loading) return;
    setLoading(true);
    setPage(page + 1);
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        cursor,
        p: page + 1,
      },
    });
  };

  const onFirst = () => {
    const { pathname, query } = router;
    const { cursor, p, ...updatedQuery } = query;
    setPage(1);
    router.push({ pathname, query: updatedQuery });
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
              disabled={page === 1 || loading}
              onClick={onFirst}
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2  text-xs font-medium rounded-md ${
                page === 1 || loading
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
              disabled={!cursor || loading}
              onClick={handleNextPage}
              className={`relative inline-flex items-center ml-1 px-2 md:px-3 py-2 rounded-md font-medium text-xs ${
                !props.cursor || loading
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
