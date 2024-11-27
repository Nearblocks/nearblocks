import { useTranslations } from 'next-intl';

import Skeleton from '../common/Skeleton';

const Summary = () => {
  const t = useTranslations();

  return (
    <div className="relative overflow-x-auto rounded-xl">
      <table className="min-w-full divide-y rounded-xl dark:divide-black-200 dark:border-black-200">
        <thead className="bg-gray-100 dark:bg-black-300 h-[51px]">
          <tr>
            <th
              className="pl-6 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              scope="col"
            ></th>
            <th
              className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              scope="col"
            >
              Receipt
            </th>
            <th
              className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              scope="col"
            >
              Action
            </th>
            <th
              className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              scope="col"
            >
              Method
            </th>
            <th
              className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              scope="col"
            >
              {t ? t('txnDetails.receipts.from.text.0') : 'From'}
            </th>
            <th
              className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              scope="col"
            ></th>
            <th
              className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              scope="col"
            >
              {t ? t('txnDetails.receipts.to.text.0') : 'To'}
            </th>
            <th
              className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              scope="col"
            >
              Value
            </th>
            <th
              className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              scope="col"
            >
              Gas Limit
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
          {[...Array(10)].map((_, i) => (
            <tr className="hover:bg-blue-900/5 h-[57px]" key={i}>
              <td className="px-2 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                <Skeleton className="w-full h-4" />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                <Skeleton className="w-full h-4" />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-tiny ">
                <Skeleton className="w-full h-4" />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                <Skeleton className="w-full h-4" />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                <Skeleton className="w-full h-4" />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                <Skeleton className="w-full h-4" />
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                <Skeleton className="w-full h-4" />
              </td>
              <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10">
                <Skeleton className="w-full h-4" />
              </td>
              <td className="px-4 py-4 text-sm text-nearblue-600 dark:text-neargray-10">
                <Skeleton className="w-full h-4" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Summary;
