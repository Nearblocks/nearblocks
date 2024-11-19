'use client';

import { Tooltip } from '@reach/tooltip';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { fetcher } from '@/hooks/useFetch';

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
    apiUrl: string;
    file: string;
    tittle: string;
  }>({} as { apiUrl: string; file: string; tittle: string });

  useEffect(() => {
    let url = '';
    let text = '';
    let file = '';
    switch (exportType) {
      case 'transactions':
        url = `account/${id}/txns-only/export?start=${startDate}&end=${endDate}`;
        text = 'Transactions';
        file = `${id}_transactions_${startDate}_${endDate}.csv`;
        break;
      case 'receipts':
        url = `account/${id}/receipts/export?start=${startDate}&end=${endDate}`;
        text = 'Receipts';
        file = `${id}_receipts_${startDate}_${endDate}.csv`;
        break;
      case 'tokentransactions':
        url = `account/${id}/ft-txns/export?start=${startDate}&end=${endDate}`;
        text = 'Token Transactions';
        file = `${id}_ft_transactions_${startDate}_${endDate}.csv`;
        break;
      case 'nfttokentransactions':
        url = `account/${id}/nft-txns/export?start=${startDate}&end=${endDate}`;
        text = 'NFT Token Transactions';
        file = `${id}_nft_transactions_${startDate}_${endDate}.csv`;
        break;
      default:
    }

    setExportInfo({ apiUrl: url, file: file, tittle: text });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportType, id, startDate, endDate]);

  const onHandleDowload = (blobUrl: string, file: string): void => {
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
      const resp = await fetcher(exportInfo.apiUrl, { responseType: 'blob' });
      const href = URL.createObjectURL(resp);
      onHandleDowload(href, exportInfo.file);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const selectedStartDate = event?.target?.value;

    setStartDate(selectedStartDate);
  };

  const handleEndDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const selectedEndDate = event?.target?.value;

    setEndDate(selectedEndDate);
  };

  return (
    <div className="bg-neargray-25 dark:bg-black-300 py-16 flex flex-col items-center">
      <h2 className="text-black dark:text-white text-2xl font-medium">
        Download Data ({exportInfo.tittle})
      </h2>
      <div className="text-sm text-neargray-600 dark:text-neargray-10 py-2 max-w-lg md:mx-12 mx-4">
        <p className="text-center">
          The information you requested can be downloaded from this page.
        </p>
        {exportInfo.tittle === 'Receipts' && (
          <p className="text-center">
            In CSV Export you will get all the receipts of the transactions.
          </p>
        )}
        <div className="bg-white dark:bg-black-600 dark:border-black-200 border rounded-md shadow-md w-full px-4 py-4 my-10">
          <p className="text-nearblue-600 dark:text-neargray-10 my-3 mx-2">
            Export the earliest 5000 records starting from
          </p>

          <div className="lg:flex justify-between items-center text-center">
            <Tooltip
              className="-mt-20 h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2 absolute"
              label={'Select Start Date'}
            >
              <div className="flex items-center border-gray-300 dark:border-black-200 rounded-md text-center px-2 py-2 w-11/12 mx-2">
                <input
                  className="border flex items-center  border-gray-300 dark:border-black-200 rounded-md px-2 py-2 w-11/12 mx-2 focus:outline-none text-center"
                  defaultValue={initial?.start}
                  id="startdate"
                  name="startdate"
                  onChange={handleStartDateChange}
                  type="date"
                />
              </div>
            </Tooltip>
            <p className="text-center">To</p>
            <Tooltip
              className="-mt-20 h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2 absolute"
              label={'Select End Date'}
            >
              <div className="flex items-center  border-gray-300 dark:border-black-200 rounded-md text-center px-2 py-2 w-11/12 mx-2">
                <input
                  className="border flex items-center  border-gray-300 rounded-md px-2 py-2 w-11/12 mx-2 focus:outline-none text-center"
                  defaultValue={initial?.end}
                  id="enddate"
                  name="enddate"
                  onChange={handleEndDateChange}
                  type="date"
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
