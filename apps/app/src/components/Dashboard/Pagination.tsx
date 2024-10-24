import React, { useEffect, useState } from 'react';
import FaChevronLeft from '../Icons/FaChevronLeft';
import FaChevronRight from '../Icons/FaChevronRight';

interface QueueItem {
  id: string;
  value: string;
}

type PaginationQueue = {
  enqueue: (item: QueueItem) => void;
  dequeue: () => QueueItem | undefined;
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

  return { enqueue, dequeue, size };
}

interface PaginationProps {
  isTopPagination: boolean;
  apiUrl: string;
  setUrl: (url: string) => void;
  enqueue: (params: string | any) => void;
  dequeue: () => QueueItem | undefined;
  size?: number;
  nextPageParams?: {};
  setPreviousPageParam: (params: QueueItem[]) => void;
  mutate: () => void;
}

const Pagination = ({
  isTopPagination,
  apiUrl,
  setUrl,
  enqueue,
  dequeue,
  size,
  nextPageParams,
  setPreviousPageParam,
  mutate,
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
              type="button"
              disabled={disabled}
              onClick={onFirst}
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 text-xs py-2 font-medium ${
                disabled
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-500 dark:text-green-250 hover:bg-green-500 dark:hover:bg-green-250 hover:text-white dark:hover:text-black'
              } rounded-md bg-gray-100 dark:bg-black-200 dark:text-green-250`}
            >
              First
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={handlePreviousPage}
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2 font-medium ${
                disabled
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-500 dark:text-green-250 hover:text-white dark:hover:text-black hover:bg-green-500 dark:hover:bg-green-250'
              } rounded-md bg-gray-100 dark:text-green-250 dark:bg-black-200`}
            >
              <FaChevronLeft className="inline-flex text-xs" />
            </button>
            <button
              type="button"
              disabled
              className="relative inline-flex items-center px-2 ml-1 md:px-3 py-2 text-xs font-medium text-gray-500 dark:text-neargray-10 rounded-md bg-gray-100 dark:bg-black-200"
            >
              Page {currentPage}
            </button>
            <button
              type="button"
              disabled={nextPageParams ? false : true}
              onClick={handleNextPage}
              className={`relative inline-flex items-center ml-1 px-2 md:px-3 py-2 rounded-md font-medium ${
                nextPageParams
                  ? 'text-green-500 dark:text-green-250 hover:text-white dark:hover:text-black hover:bg-green-500 dark:hover:bg-green-250'
                  : 'text-gray-500 dark:text-neargray-10'
              }  bg-gray-100 dark:text-green-250 dark:bg-black-200`}
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
