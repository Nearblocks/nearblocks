import Skeleton from '../common/Skeleton';

export default function AccessKeyTabSkeleton() {
  return (
    <div className="relative overflow-x-auto rounded-xl">
      <table className="min-w-full divide-y rounded-xl dark:divide-black-200 dark:border-black-200">
        <thead className="bg-gray-100 dark:bg-black-300">
          <tr>
            {[
              'Txn Hash',
              'Public key',
              'Access',
              'Contract',
              'Method',
              'Allowance',
              'Action',
              'When',
            ].map((header, index) => (
              <th
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
                key={index}
                scope="col"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
          {[...Array(25)].map((_, i) => (
            <tr className="hover:bg-blue-900/5 h-[57px]" key={i}>
              {[...Array(8)].map((_, j) => (
                <td
                  className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10"
                  key={j}
                >
                  <Skeleton className="w-full h-4" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
