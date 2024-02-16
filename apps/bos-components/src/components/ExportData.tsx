/**
 * Component: AddressTransactions
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Transactions of address on Near Protocol.
 * @interface Props
 * @param {string}  [network] - The network data to show, either mainnet or testnet.
 * @param {string} [id] - The account identifier passed as a string.
 */

import { getConfig } from '@/includes/libs';

interface Props {
  network: string;
  id: string;
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

export default function ({ network, id }: Props) {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(initial.start);
  const [endDate, setEndDate] = useState(initial.end);
  const [exportData, setExportData] = useState('');

  const config = getConfig(network);

  const onDownload = () => {
    try {
      setLoading(true);

      asyncFetch(
        `${config?.backendUrl}account/${id}/txns/export?start=${startDate}&end=${endDate}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
        .then((resp: { body: string; status: number }) => {
          if (resp.status === 200) {
            const blob = new Blob([resp.body], { type: 'text/csv' });
            const href = URL.createObjectURL(blob);
            setExportData(href);
          }
        })
        .catch((error: any) => {
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const file = `${id}_transactions_${startDate}_${endDate}.csv`;

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
      <div className="bg-neargray-25 py-16 flex flex-col items-center">
        <h2 className="text-black text-2xl font-medium">
          Download Data (Transactions)
        </h2>
        <div className="text-sm text-neargray-600 py-2 max-w-lg md:mx-12 mx-4">
          <p className="text-center">
            The information you requested can be downloaded from this page.
            Before continuing please verify that you are not a robot by
            completing the captcha below.
          </p>
          <div className="bg-white border rounded-md shadow-md w-full px-4 py-4 my-10">
            <p className="text-nearblue-600 my-3 mx-2">
              Export the earliest 5000 records starting from
            </p>

            <div className="lg:flex justify-between items-center text-center">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className="flex items-center border-gray-300 rounded-md text-center px-2 py-2 w-11/12 mx-2">
                      <input
                        type="date"
                        name="startdate"
                        id="startdate"
                        className="border flex items-center  border-gray-300 rounded-md px-2 py-2 w-11/12 mx-2 focus:outline-none text-center"
                        defaultValue={initial?.start}
                        onChange={handleStartDateChange}
                      />
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="-mt-20 h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2"
                    align="start"
                    side="bottom"
                  >
                    Select Start Date
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
              <p className="text-center">To</p>
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <div className="flex items-center  border-gray-300 rounded-md text-center px-2 py-2 w-11/12 mx-2">
                      <input
                        type="date"
                        name="enddate"
                        id="enddate"
                        className="border flex items-center  border-gray-300 rounded-md px-2 py-2 w-11/12 mx-2 focus:outline-none text-center"
                        defaultValue={initial?.end}
                        onChange={handleEndDateChange}
                      />
                    </div>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="-mt-20 h-auto max-w-xs bg-black bg-opacity-90 z-10 text-white text-xs p-2"
                    align="start"
                    side="bottom"
                  >
                    Select End Date
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
            <div className="w-full flex justify-center my-4"></div>
            <div className="w-full flex justify-center my-4">
              <div
                onClick={onDownload}
                className={`items-center cursor-pointer ${
                  loading && 'animate-pulse cursor-not-allowed'
                }  text-center bg-green-500 hover:shadow-lg  text-white text-xs py-2 rounded w-20 focus:outline-none`}
              >
                Generate
              </div>
              {exportData && (
                <div
                  className={`items-center cursor-pointer ${
                    loading && 'animate-pulse cursor-not-allowed'
                  }  text-center bg-green-500 hover:shadow-lg  text-white text-xs py-2 ml-2 rounded w-20 focus:outline-none hover:no-underline`}
                >
                  <a
                    href={`${exportData}`}
                    download={file}
                    className="hover:no-underline"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
