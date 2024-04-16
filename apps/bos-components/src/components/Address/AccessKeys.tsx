/**
 * Component: AddressAccessKeys
 * Author: Nearblocks Pte Ltd
 * License: Business Source License 1.1
 * Description: Table of Accesskey List.
 * @interface Props
 * @param {string} [network] - The network data to show, either mainnet or testnet
 * @param {Function} [t] - A function for internationalization (i18n) provided by the next-translate package.
 * @param {string} [id] - The account identifier passed as a string.
 * @param {string} ownerId - The identifier of the owner of the component.
 */

interface Props {
  network: string;
  t: (key: string) => string | undefined;
  id?: string;
  ownerId: string;
}

import { AccountContractInfo } from '@/includes/types';
import SortIcon from '@/includes/icons/SortIcon';
import Skeleton from '@/includes/Common/Skeleton';
import Paginator from '@/includes/Common/Paginator';

export default function ({ network, t, id, ownerId }: Props) {
  const { getConfig, handleRateLimit } = VM.require(
    `${ownerId}/widget/includes.Utils.libs`,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [showWhen, setShowWhen] = useState(true);
  const [sorting, setSorting] = useState('desc');
  const [count, setCount] = useState(0);
  const [keys, Setkeys] = useState<AccountContractInfo[]>([]);

  const initialPage = 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const config = getConfig && getConfig(network);

  const setPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(currentPage);
  }, [currentPage]);

  const toggleShowWhen = () => setShowWhen((s) => !s);

  const onOrder = () => {
    setSorting((state) => (state === 'asc' ? 'desc' : 'asc'));
  };

  useEffect(() => {
    setIsLoading(true);
    function fetchAccountData() {
      asyncFetch(
        `${config?.backendUrl}account/${id}/keys?order=${sorting}&page=${currentPage}&per_page=25`,
      )
        .then(
          (data: {
            body: {
              keys: AccountContractInfo[];
            };
            status: number;
          }) => {
            const resp = data?.body?.keys;
            if (data.status === 200) {
              Setkeys(resp);
              setIsLoading(false);
            } else {
              handleRateLimit(
                data,
                () => fetchAccountData(),
                () => setIsLoading(false),
              );
            }
          },
        )
        .catch(() => {});
    }

    function fetchCountData() {
      asyncFetch(`${config?.backendUrl}account/${id}/keys/count`)
        .then(
          (data: {
            body: {
              keys: { count: number }[];
            };
            status: number;
          }) => {
            const resp = data?.body?.keys?.[0]?.count || 0;
            if (data.status === 200) {
              setCount(resp);
            } else {
              handleRateLimit(data, fetchCountData);
            }
          },
        )
        .catch(() => {});
    }
    fetchAccountData();
    fetchCountData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.backendUrl, id, currentPage, sorting]);

  return (
    <>
      <div className="bg-white dark:bg-black-600 soft-shadow rounded-xl overflow-x-auto ">
        <table className="min-w-full divide-y divide-black-200 border-black-200 border-t">
          <thead className="bg-gray-100 dark:bg-black-300">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase tracking-wider"
              >
                Txn Hash
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase tracking-wider"
              >
                Public key
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider"
              >
                Access
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider"
              >
                Contract
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider"
              >
                Method
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider"
              >
                Allowance
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase tracking-wider"
              >
                Action
              </th>
              <th scope="col" className="text-left">
                <div className="w-full inline-flex px-5 py-4">
                  <button
                    type="button"
                    onClick={toggleShowWhen}
                    className="text-left text-xs w-full font-semibold uppercase tracking-wider text-nearblue-600 dark:text-neargray-10 focus:outline-none"
                  >
                    {showWhen ? 'When' : 'Date Time (UTC)'}
                  </button>
                  <button type="button" onClick={onOrder} className="px-2">
                    <div className="text-nearblue-600  dark:text-neargray-10 font-semibold">
                      <SortIcon order={sorting} />
                    </div>
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
            {isLoading &&
              [...Array(25)].map((_, i) => (
                <tr key={i} className="hover:bg-blue-900/5 h-[57px]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                    <Skeleton />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                    <Skeleton />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                    <Skeleton />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-tiny ">
                    <Skeleton />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                    <Skeleton />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                    <Skeleton />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                    <Skeleton />
                  </td>
                </tr>
              ))}
            {!isLoading && keys.length === 0 && (
              <tr className="h-[57px]">
                <td
                  colSpan={100}
                  className="px-6 py-4 text-nearblue-700 dark:text-neargray-10 text-xs"
                >
                  No access keys
                </td>
              </tr>
            )}
            {keys &&
              keys.map((key) => (
                <Widget
                  key={key.account_id + key.public_key}
                  src={`${ownerId}/widget/bos-components.components.Address.AccessKeyRow`}
                  props={{
                    network: network,
                    t: t,
                    accessKey: key,
                    showWhen: showWhen,
                    ownerId,
                  }}
                  loading={
                    <div className=" whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                      <Skeleton />
                    </div>
                  }
                />
              ))}
          </tbody>
        </table>
        <Paginator
          count={count}
          page={currentPage}
          limit={25}
          pageLimit={200}
          setPage={setPage}
        />
      </div>
    </>
  );
}
