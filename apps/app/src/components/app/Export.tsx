'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';

import Tooltip from '@/components/app/common/Tooltip';
import { handleExport } from '@/utils/app/actions';
import DateInput from '@/components/app/common/DateInput';

interface Props {
  exportType: string;
  id: any | string;
}

const today = new Date();
const startOfCurrentMonth = new Date(
  Date.UTC(today.getFullYear(), today.getMonth(), 1),
);
const endOfCurrentMonth = new Date(
  Date.UTC(today.getFullYear(), today.getMonth() + 1, 0),
);

const formattedStart =
  startOfCurrentMonth && startOfCurrentMonth?.toISOString()?.split('T')[0];
const formattedEnd =
  endOfCurrentMonth && endOfCurrentMonth?.toISOString()?.split('T')[0];

const initial = {
  end: formattedEnd,
  start: formattedStart,
};

const Export: React.FC<Props> = ({ exportType, id }) => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(initial.start);
  const [endDate, setEndDate] = useState(initial.end);
  const [exportInfo, setExportInfo] = useState<{
    title: string;
  }>({ title: '' });

  const onHandleDownload = (blobUrl: string, file: string): void => {
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = blobUrl;
    a.target = '_blank';
    a.setAttribute('download', file);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const onDownload = async () => {
    try {
      setLoading(true);
      const { blob, filename, title } = await handleExport({
        exportType,
        id: id.toString(),
        startDate,
        endDate,
      });

      const href = URL.createObjectURL(blob);
      onHandleDownload(href, filename);

      setExportInfo({ title });
    } catch (error: any) {
      toast.error(error.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (newDate: string) => {
    setStartDate(newDate);
  };

  const handleEndDateChange = (newDate: string) => {
    setEndDate(newDate);
  };

  return (
    <div className="bg-neargray-25 dark:bg-black-300 py-16 flex flex-col items-center text-center">
      <h2 className="text-nearblue-600 dark:text-neargray-10 text-2xl font-medium">
        Download Data {exportInfo.title ? `(${exportInfo.title})` : ''}
      </h2>
      <div className="text-sm text-neargray-600 dark:text-neargray-10 py-2 max-w-lg md:mx-12 mx-4">
        <p className="text-center">
          The information you requested can be downloaded from this page.
        </p>
        {exportType === 'receipts' && (
          <p className="text-center">
            In CSV Export you will get all the receipts of the transactions.
          </p>
        )}
        <div className="bg-white dark:bg-black-600 dark:border-black-200 border rounded-md shadow-md w-full px-4 py-4 my-10">
          <p className="text-nearblue-600 dark:text-neargray-10 my-4 mx-2">
            Export the earliest 5000 records starting from
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 sm:flex gap-y-3 justify-between items-center text-center">
            <Tooltip
              className={'ml-4 max-w-[200px] whitespace-nowrap'}
              position="top"
              tooltip={'Select Start Date'}
            >
              <div className="flex items-center border-gray-300 dark:border-black-200 rounded-md text-center">
                <DateInput
                  value={startDate}
                  onChange={handleStartDateChange}
                  id="startdate"
                  name="startdate"
                />
              </div>
            </Tooltip>
            <div className="flex mx-auto">To</div>
            <Tooltip
              className={'ml-5 max-w-[200px] whitespace-nowrap'}
              position="top"
              tooltip={'Select End Date'}
            >
              <div className="flex items-center border-gray-300 dark:border-black-200 rounded-md text-center">
                <DateInput
                  value={endDate}
                  onChange={handleEndDateChange}
                  id="enddate"
                  name="enddate"
                />
              </div>
            </Tooltip>
          </div>
          <div className="w-full flex justify-center my-4"></div>
          <div className="w-full flex justify-center my-4">
            <div
              className={`items-center cursor-pointer ${
                loading && 'animate-pulse cursor-not-allowed'
              }  text-center bg-green-500 dark:bg-green-250 dark:text-neargray-10 hover:shadow-lg  text-white text-xs py-2 rounded w-20 focus:outline-none`}
              onClick={onDownload}
            >
              Generate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Export;
