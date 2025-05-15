import React, { useEffect, useState } from 'react';

import FaChevronLeft from '@/components/app/Icons/FaChevronLeft';
import FaChevronRight from '@/components/app/Icons/FaChevronRight';

interface QueueItem {
  id: string;
  value: string;
}

type PaginationQueue = {
  dequeue: () => QueueItem | undefined;
  enqueue: (item: QueueItem) => void;
  size: () => number;
};

export function paginationQueue(
  queue: QueueItem[],
  setQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>,
): PaginationQueue {
  const enqueue = (item: QueueItem) => {
    setQueue((prevQueue) => [...prevQueue, item]);
  };

  const dequeue = () => {
    if (queue.length === 0) {
      return undefined;
    }
    const lastItem = queue[queue.length - 2];
    setQueue(queue.slice(0, -1));
    return lastItem;
  };

  const size = () => queue.length;

  return { dequeue, enqueue, size };
}

interface PaginationProps {
  apiUrl: string;
  dequeue: () => QueueItem | undefined;
  enqueue: (params: any | string) => void;
  isTopPagination: boolean;
  mutate: () => void;
  nextPageParams?: {};
  setPreviousPageParam: (params: QueueItem[]) => void;
  setUrl: (url: string) => void;
  size?: number;
  isLoading?: boolean;
}

const Pagination = ({
  apiUrl,
  dequeue,
  enqueue,
  isTopPagination,
  mutate,
  nextPageParams,
  setPreviousPageParam,
  setUrl,
  size,
  isLoading = false,
}: PaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const queueSize = size ?? 0;
    setCurrentPage(queueSize + 1);
    setDisabled(queueSize + 1 < 2 ? true : false);
  }, [size]);

  function constructURL(params: any) {
    let url = apiUrl;
    if (params) {
      const queryParams = Object.fromEntries(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [key, String(value)]),
      );

      const queryString = new URLSearchParams(queryParams).toString();
      url = `${apiUrl}${queryString}`;
    }

    return url;
  }

  const handleNextPage = () => {
    setUrl(constructURL(nextPageParams));
    enqueue(nextPageParams);
  };

  const handlePreviousPage = () => {
    const previousPage = dequeue();
    setUrl(constructURL(previousPage));
    mutate;
  };
  const onFirst = () => {
    setPreviousPageParam([]);
    setUrl(apiUrl);
  };

  return (
    <>
      <div
        className={`bg-white px-4 pt-1 border-t dark:border-black-200 dark:bg-black-600 flex items-center lg:justify-between justify-end ${
          isTopPagination ? '' : 'border-t dark:border-black-200 px-2 py-3'
        }`}
      >
        <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div></div>
          <div
            className={`flex justify-end ${
              isTopPagination ? 'mt-2 lg:mt-0' : 'm-2'
            }`}
          >
            <button
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 text-xs py-2 font-medium disabled:cursor-not-allowed ${
                disabled || isLoading
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-500 dark:text-green-250 hover:bg-green-500 dark:hover:!bg-green-250 hover:text-white dark:hover:!text-black'
              } rounded-md bg-gray-100 dark:bg-black-200 dark:text-green-250`}
              disabled={disabled || isLoading}
              onClick={onFirst}
              type="button"
            >
              First
            </button>
            <button
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2 font-medium disabled:cursor-not-allowed ${
                disabled || isLoading
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-500 dark:text-green-250 hover:text-white dark:hover:!text-black hover:bg-green-500 dark:hover:!bg-green-250'
              } rounded-md bg-gray-100 dark:text-green-250 dark:bg-black-200`}
              disabled={disabled || isLoading}
              onClick={handlePreviousPage}
              type="button"
            >
              <FaChevronLeft className="inline-flex text-xs" />
            </button>
            <button
              className="relative inline-flex items-center px-2 ml-1 md:px-3 py-2 text-xs font-medium text-gray-500 dark:text-neargray-10 rounded-md bg-gray-100 dark:bg-black-200"
              disabled
              type="button"
            >
              Page {currentPage}
            </button>
            <button
              className={`relative inline-flex items-center ml-1 px-2 md:px-3 py-2 rounded-md font-medium disabled:cursor-not-allowed ${
                nextPageParams || isLoading
                  ? 'text-green-500 dark:text-green-250 hover:text-white dark:hover:!text-black hover:bg-green-500 dark:hover:!bg-green-250'
                  : 'text-gray-500 dark:text-neargray-10'
              }  bg-gray-100 dark:text-green-250 dark:bg-black-200`}
              disabled={nextPageParams ? false : true || isLoading}
              onClick={handleNextPage}
              type="button"
            >
              <FaChevronRight className="inline-flex text-xs" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pagination;
