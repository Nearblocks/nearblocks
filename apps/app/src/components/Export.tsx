import { fetcher } from '@/hooks/useFetch';
import { Tooltip } from '@reach/tooltip';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

interface Props {
  id: string | any;
  onHandleDowload: (blobUrl: string, file: string) => void;
  exportType: string;
}

const today = new Date();
const startOfCurrentMonth = new Date(
  Date.UTC(today.getFullYear(), today.getMonth(), 1),
);
const endOfCurrentMonth = new Date(
  Date.UTC(today.getFullYear(), today.getMonth() + 1, 0),
);

const formattedStart = startOfCurrentMonth.toISOString().split('T')[0];
const formattedEnd = endOfCurrentMonth.toISOString().split('T')[0];

const initial = {
  start: formattedStart,
  end: formattedEnd,
};

const Export: React.FC<Props> = ({ id, onHandleDowload, exportType }) => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(initial.start);
  const [endDate, setEndDate] = useState(initial.end);
  const [exportInfo, setExportInfo] = useState<{
    apiUrl: string;
    tittle: string;
    file: string;
  }>({} as { apiUrl: string; tittle: string; file: string });

  useEffect(() => {
    let url = '';
    let text = '';
    let file = '';
    switch (exportType) {
      case 'Transactions':
        url = `account/${id}/txns/export?start=${startDate}&end=${endDate}`;
        text = 'Receipts';
        file = `${id}_transactions_${startDate}_${endDate}.csv`;
        break;
      case 'Token Transactions':
        url = `account/${id}/ft-txns/export?start=${startDate}&end=${endDate}`;
        text = 'Token Transactions';
        file = `${id}_ft_transactions_${startDate}_${endDate}.csv`;
        break;
      case 'NFT Token Transactions':
        url = `account/${id}/nft-txns/export?start=${startDate}&end=${endDate}`;
        text = 'NFT Token Transactions';
        file = `${id}_nft_transactions_${startDate}_${endDate}.csv`;
        break;
      default:
    }

    setExportInfo({ apiUrl: url, tittle: text, file: file });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportType, id, startDate, endDate]);

  const onDownload = async () => {
    console.log(exportInfo);
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
    const selectedStartDate = event.target.value;

    setStartDate(selectedStartDate);
  };

  const handleEndDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const selectedEndDate = event.target.value;

    setEndDate(selectedEndDate);
  };

  return (
    <>
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
                label={'Select Start Date'}
                className="-mt-20 h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2 absolute"
              >
                <div className="flex items-center border-gray-300 dark:border-black-200 rounded-md text-center px-2 py-2 w-11/12 mx-2">
                  <input
                    type="date"
                    name="startdate"
                    id="startdate"
                    className="border flex items-center  border-gray-300 dark:border-black-200 rounded-md px-2 py-2 w-11/12 mx-2 focus:outline-none text-center"
                    defaultValue={initial?.start}
                    onChange={handleStartDateChange}
                  />
                </div>
              </Tooltip>
              <p className="text-center">To</p>
              <Tooltip
                label={'Select End Date'}
                className="-mt-20 h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2 absolute"
              >
                <div className="flex items-center  border-gray-300 dark:border-black-200 rounded-md text-center px-2 py-2 w-11/12 mx-2">
                  <input
                    type="date"
                    name="enddate"
                    id="enddate"
                    className="border flex items-center  border-gray-300 rounded-md px-2 py-2 w-11/12 mx-2 focus:outline-none text-center"
                    defaultValue={initial?.end}
                    onChange={handleEndDateChange}
                  />
                </div>
              </Tooltip>
            </div>
            <div className="w-full flex justify-center my-4"></div>
            <div className="w-full flex justify-center my-4">
              <div
                onClick={onDownload}
                className={`items-center cursor-pointer ${
                  loading && 'animate-pulse cursor-not-allowed'
                }  text-center bg-green-500 dark:bg-green-250 dark:text-neargray-10 hover:shadow-lg  text-white text-xs py-2 rounded w-20 focus:outline-none`}
              >
                Generate
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Export;
