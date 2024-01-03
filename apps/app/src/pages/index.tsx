import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
const HomePage = () => {
  const components = useBosComponents();
  const { t } = useTranslation();

  return (
    <>
      <div className="flex items-center justify-center bg-hero-pattern">
        <div className="container mx-auto px-3 pt-14 pb-8 mb-10 ">
          <div className="flex flex-col lg:flex-row pb-5">
            <div className="lg:w-3/5  flex-col">
              <h1 className="text-white text-2xl pb-3 flex flex-col">
                {t('home:heroTitle')}
              </h1>
              <div className="flex flex-grow">
                <VmComponent
                  src={components?.search}
                  props={{
                    isHeader: false,
                    t: t,
                    network: networkId,
                  }}
                />
              </div>
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
      <VmComponent
        src={components?.transactionsOverview}
        props={{ network: networkId }}
      />
      <div className="py-8 relative"></div>
      <section>
        <div className="container mx-auto px-3  z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="w-full">
              <div className="bg-white soft-shadow rounded-lg overflow-hidden mb-6 md:mb-10">
                <h2 className="border-b p-3 text-gray-500 text-sm font-semibold">
                  {t('home:latestBlocks')}
                </h2>
                <VmComponent
                  src={components?.blocksLatest}
                  props={{ network: networkId }}
                />
              </div>
            </div>
            <div className="w-full">
              <div className="bg-white soft-shadow rounded-lg overflow-hidden mb-6 md:mb-10">
                <h2 className="border-b p-3 text-gray-500 text-sm font-semibold">
                  {t('home:latestTxns')}
                </h2>
                <VmComponent
                  src={components?.transactionsLatest}
                  props={{ network: networkId }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
