import Skeleton from '../common/Skeleton';
const Tree = () => {
  return (
    <>
      <div className="w-full mx-auto">
        <div className="p-4 md:px-8">
          <div className="md:flex justify-center w-full lg:h-[36vh]">
            <div className="w-full md:w-7/12 lg:w-2/3 xl:w-3/4 ">
              <div className="py-2">
                <Skeleton className="w-full h-80" />{' '}
              </div>
            </div>
            <div className="w-full md:w-5/12 lg:w-1/3 xl:w-1/4">
              <div className="text-green-500 dark:text-green-250 text-xl pt-3 pl-3">
                Receipt
              </div>
              <div className="w-full pl-3 py-2 flex items-center">
                Predecessor: <Skeleton className="w-full h-4" />{' '}
              </div>
              <div className="w-full pl-3 py-2 flex items-center">
                Receiver: <Skeleton className="w-full h-4" />{' '}
              </div>
              <div className="w-full pl-3 word-break space-y-4">
                <Skeleton className="w-full h-10" />{' '}
              </div>

              <div className="text-green-500 dark:text-green-250 text-xl pt-3 pl-3">
                Execution Outcomes
              </div>
              <div className="pl-3 py-2">
                <span className="text-base">Logs:</span>

                <div className="w-full break-words space-y-4">
                  <Skeleton className="w-full h-4" />{' '}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Tree;
