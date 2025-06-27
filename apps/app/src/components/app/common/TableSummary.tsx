import React from 'react';

const TableSummary = ({
  filters = <></>,
  linkToDowload = <></>,
  text = <></>,
}: any) => {
  return (
    <div className={`flex flex-wrap py-4 w-full items-center justify-between`}>
      <div className="flex flex-col">
        <p className="flex leading-7 pl-6 pr-2 text-sm text-nearblue-600 dark:text-neargray-10">
          {text}
        </p>
      </div>
      <div className="flex px-4 text-sm text-nearblue-600 dark:text-neargray-10 items-center justify-between flex-nowrap">
        <div className="flex pr-2 py-1">{filters}</div>
        <div className="flex items-center sm:mb-0">{linkToDowload}</div>
      </div>
    </div>
  );
};
export default TableSummary;
