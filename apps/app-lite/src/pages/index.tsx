import Search from '@/components/Header/Search';
import MainLayout from '@/components/Layouts/Main';
import Meta from '@/components/Meta';
import { PageLayout } from '@/types/types';

const Home: PageLayout = () => {
  return (
    <>
      <Meta
        description="Check real-time data on the NEAR blockchain"
        title="Near RPC based Explorer | Near Validate"
      />
      <div className="relative container mx-auto">
        <div className="py-[58px] px-6 text-center">
          <h1 className="font-heading font-bold text-[40px] lg:text-[48px] tracking-[-1.08px] leading-[115%]">
            NEAR RPC based Explorer
          </h1>
          <h2 className="font-heading font-normal text-[16px] lg:text-[20px] tracking-[0.3px] my-5 leading-[130%]">
            Here you can check the real-time data from any NEAR RPC node.
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
