import useTranslation from 'next-translate/useTranslation';
import Skeleton from '../common/Skeleton';

const Summary = () => {
  const { t } = useTranslation('txns');

  return (
    <div className="relative overflow-x-auto rounded-xl">
      <table className="min-w-full divide-y rounded-xl dark:divide-black-200 dark:border-black-200">
        <thead className="bg-gray-100 dark:bg-black-300 h-[51px]">
          <tr>
            <th
              scope="col"
              className="px-6 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
            >
              Action
            </th>
            <th
              scope="col"
              className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
            >
              Method
            </th>
            <th
              scope="col"
              className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600  dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
            >
              {t ? t('txns:txn.receipts.from.text.0') : 'From'}
            </th>
            <th
              scope="col"
              className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
            ></th>
            <th
              scope="col"
              className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
            >
              {t ? t('txns:txn.receipts.to.text.0') : 'To'}
            </th>
            <th
              scope="col"
              className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
            >
              Value
            </th>
            <th
              scope="col"
              className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
            >
              Gas Limit
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
          {[...Array(10)].map((_, i) => (
            <tr key={i} className="hover:bg-blue-900/5 h-[57px]">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Summary;
