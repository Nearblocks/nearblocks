import React from 'react';

import FaChevronLeft from '../Icons/FaChevronLeft';
import FaChevronRight from '../Icons/FaChevronRight';

type Props = {
  currentPage?: number;
  firstPageUrl: string;
  mutate: () => void;
  nextPageUrl: string;
  prevPageUrl: string;
  setUrl: (url: string) => void;
};

const CampaignPagination = ({
  currentPage,
  firstPageUrl,
  mutate,
  nextPageUrl,
  prevPageUrl,
  setUrl,
}: Props) => {
  const handleNextPage = () => {
    setUrl(nextPageUrl);
    mutate();
  };
  const handlePreviousPage = () => {
    setUrl(prevPageUrl);
    mutate();
  };
  const onFirst = () => {
    setUrl(firstPageUrl);
    mutate();
  };
  return (
    <>
      <div
        className={`bg-white px-4 pt-2 border-t dark:border-black-200 dark:bg-black-600 dark:text-neargray-10 flex items-center lg:justify-between justify-end`}
      >
        <div className="sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div></div>
          <div
            className={`flex justify-end ${
              !'isTopPagination' ? 'mt-2 lg:mt-0' : 'm-2'
            }`}
          >
            <button
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 text-xs py-2 font-medium ${
                currentPage === 1
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-500 dark:text-green-250 hover:bg-green-500 dark:hover:bg-green-250 hover:text-white dark:hover:text-black'
              } rounded-md bg-gray-100 dark:bg-black-200 dark:text-green-250`}
              disabled={currentPage === 1}
              onClick={onFirst}
              type="button"
            >
              First
            </button>
            <button
              className={`relative inline-flex items-center px-2 ml-1 md:px-3 py-2 font-medium ${
                !prevPageUrl
                  ? 'text-gray-500 dark:text-neargray-10'
                  : 'text-green-500 dark:text-green-250 hover:text-white dark:hover:text-black hover:bg-green-500 dark:hover:bg-green-250'
              } rounded-md bg-gray-100 dark:text-green-250 dark:bg-black-200`}
              disabled={!prevPageUrl}
              onClick={handlePreviousPage}
              type="button"
            >
              <FaChevronLeft className="inline-flex text-xs" />
            </button>
            <button
              className="relative inline-flex items-center px-2 ml-1 md:px-3 py-2 text-xs font-medium text-gray-500 dark:text-neargray-10 rounded-md  bg-gray-100 dark:bg-black-200"
              disabled
              type="button"
            >
              Page {currentPage}
            </button>
            <button
              className={`relative inline-flex items-center ml-1 px-2 md:px-3 py-2 rounded-md font-medium ${
                nextPageUrl
                  ? 'text-green-500 dark:text-green-250 hover:text-white dark:hover:text-black hover:bg-green-500 dark:hover:bg-green-250'
                  : 'text-gray-500 dark:text-neargray-10'
              }  bg-gray-100 dark:text-green-250 dark:bg-black-200`}
              disabled={!nextPageUrl}
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

export default CampaignPagination;
