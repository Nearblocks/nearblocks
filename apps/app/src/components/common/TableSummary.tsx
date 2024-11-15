import React from 'react';

const TableSummary = ({
  filters = <></>,
  linkToDowload = <></>,
  text = <></>,
}: any) => {
  return (
    <div
      className={`md:flex sm:flex-1 flex-1 w-full items-center py-4 justify-center`}
    >
      <div className="flex w-full items-center">
        <p className="flex leading-7 pl-6 text-sm text-nearblue-600 dark:text-neargray-10">
          {text}
        </p>
      </div>
      <div className="sm:flex px-4 text-sm text-nearblue-600 dark:text-neargray-10 items-center justify-between flex-nowrap">
        <div className="flex px-2 whitespace-nowrap py-1">{filters}</div>
        <div className="flex whitespace-nowrap items-center sm:mb-0">
          {linkToDowload}
        </div>
      </div>
    </div>
  );
};
export default TableSummary;
