import React from 'react';

const TableSummary = ({
  text = <></>,
  filters = <></>,
  linkToDowload = <></>,
}: any) => {
  return (
    <div
      className={`flex flex-col lg:flex-row sm:items-center sm:justify-center`}
    >
      <div className="flex flex-col sm:items-center py-4">
        <p className="leading-7 pl-6 text-sm text-nearblue-600 dark:text-neargray-10">
          {text}
        </p>
      </div>
      <div className="flex flex-col px-4 text-sm text-nearblue-600 dark:text-neargray-10 lg:flex-row lg:ml-auto lg:items-center lg:justify-between">
        <div className="px-2 sm:mt-4">{filters}</div>
        <div className="flex items-center space-x-4 md:mb-0 mb-4 ml-2 md:ml-0">
          {linkToDowload}
        </div>
      </div>
    </div>
  );
};
export default TableSummary;
