import Skeleton from '@/components/app/_components/skeleton/common/Skeleton';

export default function TableSkeleton() {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200 border-t">
          <thead className="bg-gray-100 dark:bg-black-300 h-[51px]">
            <tr>
              {[...Array(8)].map((_, index) => (
                <th key={index} scope="col" className="px-6 py-3">
                  <Skeleton className="h-4 w-full" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-black-600 dark:divide-black-200 divide-y divide-gray-200">
            {[...Array(20)].map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-blue-900/5 h-[57px]">
                {[...Array(8)].map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
