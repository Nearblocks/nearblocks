import { VmComponent } from '@/components/vm/VmComponent';
import { useBosComponents } from '@/hooks/useBosComponents';
import { networkId } from '@/utils/config';
import useTranslation from 'next-translate/useTranslation';
const TopFTTokens = () => {
  const components = useBosComponents();
  const { t } = useTranslation();

  return (
    <>
      <section>
        <div className="bg-hero-pattern h-72">
          <div className="container mx-auto px-3">
            <h1 className="mb-4 pt-8 sm:text-2xl text-xl text-white">
              Near Protocol Ecosystem Tokens (NEP-141)
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-3 -mt-48">
          <div className="block lg:flex lg:space-x-2">
            <div className="w-full">
              <div className="bg-white border soft-shadow rounded-lg pb-1">
                <VmComponent
                  src={components?.tokens}
                  props={{
                    t: t,
                    network: networkId,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="py-8">{/* <Banner1 /> */}</div>
      </section>
    </>
  );
};

export default TopFTTokens;
