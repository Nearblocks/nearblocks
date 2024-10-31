import TableSkeleton from '../common/table';

export default function ListSkeleton() {
  return (
    <div className=" bg-white dark:bg-black-600 dark:border-black-200 border soft-shadow rounded-xl overflow-hidden">
      <div className={`flex flex-col lg:flex-row pt-4`}>
        <div className="flex flex-col">
          <p className="leading-7 pl-6 text-sm mb-4 text-nearblue-600 dark:text-neargray-10 h-7" />
        </div>
      </div>
      <TableSkeleton />
    </div>
  );
}
