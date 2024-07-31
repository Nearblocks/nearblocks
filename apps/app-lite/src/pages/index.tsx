import Search from '@/components/Header/Search';
import MainLayout from '@/components/Layouts/Main';
import Meta from '@/components/Meta';
import { PageLayout } from '@/types/types';

const Home: PageLayout = () => {
  return (
    <>
      <Meta
        description="Check real-time data on the NEAR blockchain"
        title="Near Stateless Explorer | NearBlocks Lite"
      />
      <div className="relative container mx-auto">
        <div className="py-[58px] px-6 text-center">
          <h1 className="font-heading font-bold text-[40px] lg:text-[48px] tracking-[1px]">
            Hello, I’m the Near stateless explorer
          </h1>
          <h2 className="font-heading font-medium text-[32px] lg:text-[40px] tracking-[0.4px] mt-[-3px]">
            With me, you can check real-time data on the NEAR blockchain.
          </h2>
        </div>
        <div className="flex items-center justify-center w-full mt">
          <div className="lg:w-1/2 flex items-center justify-center">
            <Search
              className="shadow bg-bg-box font-sans font-light text-text-box w-full h-16 flex items-center"
              dropdownClassName="rounded-b-lg"
            />
          </div>
        </div>
      </div>
    </>
  );
};

Home.getLayout = (page) => <MainLayout hideSearch={true}>{page}</MainLayout>;

export default Home;
