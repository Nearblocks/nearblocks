'use client';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import { useIntlRouter, usePathname } from '@/i18n/routing';

import FaChevronLeft from '@/components/app/Icons/FaChevronLeft';
import FaChevronRight from '@/components/app/Icons/FaChevronRight';
interface PaginatorProps {
  count: number;
  isLoading?: boolean;
  limit: number;
  page?: any;
  pageLimit: number;
  setPage?: any;
  shallow?: boolean;
}
const Paginator = (props: PaginatorProps) => {
  const t = useTranslations();
  const intlRouter = useIntlRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const page = searchParams?.get('page');
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
    const newParams = new URLSearchParams(searchParams || '');
    newParams.set('page', String(newPage));

    intlRouter.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const onNext = () => {
    if (currentPage >= pages) return;
    const newPage = currentPage + 1;
    const newParams = new URLSearchParams(searchParams || '');
    newParams.set('page', String(newPage));
    intlRouter.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const onFirst = () => {
    const newParams = new URLSearchParams(searchParams || '');
    newParams.set('page', '1');
    intlRouter.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const onLast = () => {
    const newParams = new URLSearchParams(searchParams || '');
    newParams.set('page', pages.toString());
    intlRouter.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  };
  return (
    <div className="bg-white dark:bg-black-600 px-2 py-3 flex items-center justify-between border-t dark:border-black-200 md:px-4 rounded-b-xl">
      <div className="flex-1 flex items-center justify-between">
        <div></div>
        <div>
          <div
            aria-label="Pagination"
            className="relative z-0 inline-flex rounded-md"
          >
            <button
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2  text-xs font-medium rounded-md ${
                currentPage <= 1
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:bg-green-400 dark:hover:bg-green-250 hover:text-white dark:hover:!text-black'
              } bg-gray-100 dark:bg-black-200 dark:text-green-250`}
              disabled={currentPage <= 1 || pages === 1}
              onClick={onFirst}
              type="button"
            >
              {t('pagination.first')}
            </button>
            <button
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2 font-medium ${
                currentPage <= 1
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:text-white dark:hover:!text-black hover:bg-green-400 dark:hover:bg-green-250'
              } rounded-md  bg-gray-100 dark:bg-black-200`}
              disabled={currentPage <= 1 || pages === 1}
              onClick={onPrev}
              type="button"
            >
              <FaChevronLeft />
            </button>
            <button
              className="relative inline-flex items-center px-2 ml-1 md:px-3 py-2 text-xs font-medium text-gray-500  rounded-md  bg-gray-100 dark:bg-black-200 dark:text-neargray-10"
              disabled
              type="button"
            >
              Page {currentPage} of {pages}
            </button>
            <button
              className={`relative inline-flex items-center ml-1 px-2 md:px-3 py-2 rounded-md font-medium ${
                currentPage >= pages
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:text-white dark:hover:!text-black hover:bg-green-400 dark:hover:bg-green-250'
              }  bg-gray-100 dark:text-green-250 dark:bg-black-200`}
              disabled={currentPage >= pages || pages === 1}
              onClick={onNext}
              type="button"
            >
              <FaChevronRight />
            </button>
            <button
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2 text-xs font-medium rounded-md ${
                currentPage >= pages
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-400 dark:text-green-250 hover:text-white dark:hover:!text-black hover:bg-green-400 dark:hover:bg-green-250'
              }  bg-gray-100 dark:text-green-250 dark:bg-black-200`}
              disabled={currentPage >= pages || pages === 1}
              onClick={onLast}
              type="button"
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
