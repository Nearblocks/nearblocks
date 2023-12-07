import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';

const HomePage = () => {
  const components = useBosComponents();

  return (
    <>
      <div className="flex items-center justify-center bg-hero-pattern">
        <div className="container mx-auto px-3 pt-14 pb-8 mb-10 ">
          <div className="flex flex-col lg:flex-row pb-5">
            <div className="lg:w-3/5 w-full flex-col">
              <h1 className="text-white text-2xl pb-3 flex flex-col">
                Near Protocol Explorer
              </h1>
              <div className="flex flex-grow"></div>
              <div className="text-white">
                <VmComponent
                  src={components?.sponsoredText}
                  props={{ textColor: true }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <VmComponent src={components?.transactionOverview} />
      <div className="py-8 relative"></div>
      <section>
        <div className="container mx-auto px-3  z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="w-full">
              <div className="bg-white soft-shadow rounded-lg overflow-hidden mb-6 md:mb-10">
                <h2 className="border-b p-3 text-gray-500 text-sm font-semibold">
                  Latest Blocks
                </h2>
                <VmComponent src={components?.latestBlocks} />
              </div>
            </div>
            <div className="w-full">
              <div className="bg-white soft-shadow rounded-lg overflow-hidden mb-6 md:mb-10">
                <h2 className="border-b p-3 text-gray-500 text-sm font-semibold">
                  Latest Transactions
                </h2>
                <VmComponent src={components?.latestTransactions} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
