import Skeleton from "../common/Skeleton";

export default function AccessKeyTabSkeleton() {
  return (
    <div className="relative overflow-x-auto rounded-xl">
      <table className="min-w-full divide-y rounded-xl dark:divide-black-200 dark:border-black-200">
        <thead className="bg-gray-100 dark:bg-black-300">
          <tr>
            {/* Repeat for all table headers */}
            {['Txn Hash', 'Public key', 'Access', 'Contract', 'Method', 'Allowance', 'Action', 'When'].map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-4 py-4 text-left text-xs font-semibold text-nearblue-600 dark:text-neargray-10 uppercase whitespace-nowrap tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
          {[...Array(25)].map((_, i) => (
            <tr key={i} className="hover:bg-blue-900/5 h-[57px]">
              {/* Repeat for all table columns */}
              {[...Array(8)].map((_, j) => (
                <td key={j} className="px-4 py-4 whitespace-nowrap text-sm text-nearblue-600 dark:text-neargray-10">
                  <Skeleton className="w-full h-4" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
