import useTranslation from 'next-translate/useTranslation';
import FaChevronLeft from '../Icons/FaChevronLeft';
import FaChevronRight from '../Icons/FaChevronRight';
import { useRouter } from 'next/router';

interface PaginatorProps {
  count: number;
  limit: number;
  pageLimit: number;
}

const Paginator = (props: PaginatorProps) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { page } = router.query;
  const currentPage = page ? Number(page) : 1;

  let pages: number;
  const { count, limit, pageLimit = 200 } = props;

  if (count > 0) {
    pages = Math.ceil(count / limit);
  } else {
    pages = 1;
  }
  
  pages = pages > pageLimit ? pageLimit : pages;

  const onPrev = () => {
    if (currentPage <= 1) return;

    const newPage = currentPage - 1;

    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage },
    });
  };

  const onNext = () => {
    if (currentPage >= pages) return;

    const newPage = currentPage + 1;

    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage },
    });
  };

  const onFirst = () => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: 1 },
    });
  };

  const onLast = () => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: pages },
    });
  };

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
              disabled={currentPage <= 1 || pages === 1}
              onClick={onFirst}
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2  text-xs font-medium rounded-md ${
                currentPage <= 1
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:bg-green-400 dark:hover:bg-green-250 hover:text-white dark:hover:text-black'
              } bg-gray-100 dark:bg-black-200 dark:text-green-250`}
            >
              {t('pagination.first')}
            </button>
            <button
              type="button"
              disabled={currentPage <= 1 || pages === 1}
              onClick={onPrev}
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2 font-medium ${
                currentPage <= 1
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
              Page {currentPage} of {pages}
            </button>
            <button
              type="button"
              disabled={currentPage >= pages || pages === 1}
              onClick={onNext}
              className={`relative inline-flex items-center ml-1 px-2 md:px-3 py-2 rounded-md font-medium ${
                currentPage >= pages
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:text-white dark:hover:text-black hover:bg-green-400 dark:hover:bg-green-250'
              }  bg-gray-100 dark:text-green-250 dark:bg-black-200`}
            >
              <FaChevronRight />
            </button>
            <button
              type="button"
              disabled={currentPage >= pages || pages === 1}
              onClick={onLast}
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2 text-xs font-medium rounded-md ${
                currentPage >= pages
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:text-white dark:hover:text-black hover:bg-green-400 dark:hover:bg-green-250'
              }  bg-gray-100 dark:text-green-250 dark:bg-black-200`}
            >
              {t('pagination.last')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paginator;
