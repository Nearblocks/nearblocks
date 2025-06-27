import Skeleton from '@/components/app/skeleton/common/Skeleton';

export default function NFTTxnsSkeleton() {
  return (
    <div className=" bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden">
      <div className={`flex flex-col lg:flex-row pt-4`}>
        <div className="flex flex-col">
          <p className="leading-7 pl-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10 h-7" />
        </div>
      </div>
      <div className="overflow-x-auto scroll-smooth">
        <table className="min-w-full divide-y dark:divide-black-200 dark:border-black-200  border-t">
          <thead className="bg-gray-100 dark:bg-black-200 h-[51px]">
            <tr>
              <th
                className="w-[0.2%] pl-3 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              ></th>
              <th
                className="w-[2%] pl-4 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4" />
              </th>
              <th
                className="w-[1%] pl-12 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4" />
              </th>
              <th
                className="w-[2%] pl-16 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4" />
              </th>
              <th
                className="w-[2%] pl-16 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4" />
              </th>
              <th
                className="w-[1.4%] pl-8 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4" />
              </th>
              <th
                className="w-[2%] pl-4 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4" />
              </th>
              <th
                className="w-[2%] pl-12 pr-2 py-4 whitespace-nowrap text-sm text-nearblue-600"
                scope="col"
              >
                <Skeleton className="h-4" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-black-600 dark:divide-black-200  divide-y divide-gray-200">
            {[...Array(25)].map((_, i) => (
              <tr className="hover:bg-blue-900/5 h-[57px]" key={i}>
                <td className="pl-3 py-4 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4" />
                </td>
                <td className="pl-4 py-4 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4" />
                </td>
                <td className="pl-12 py-4 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4" />
                </td>
                <td className="pl-16 py-4 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4" />
                </td>
                <td className="pl-16 py-4 whitespace-nowrap text-tiny ">
                  <Skeleton className="h-4" />
                </td>
                <td className="pl-8 py-4 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4" />
                </td>
                <td className="pl-4 py-4 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4" />
                </td>
                <td className="pl-12 pr-2 py-4 whitespace-nowrap text-sm text-nearblue-600">
                  <Skeleton className="h-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white dark:bg-black-600 dark:border-black-200 px-2 py-5 flex items-center justify-between border-t md:px-4">
        <div className="flex items-center justify-between w-full">
          <div></div>
          <Skeleton className="w-64 h-5" />
        </div>
      </div>
    </div>
  );
}
