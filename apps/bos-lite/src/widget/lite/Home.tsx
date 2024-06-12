let HomeChartSkeleton = window?.HomeChartSkeleton || (() => <></>);
let HomeStatsSkeleton = window?.HomeStatsSkeleton || (() => <></>);

const App = () => {
  return (
    <div className="relative container mx-auto">
      <div className="py-[58px] px-6">
        <h1 className="font-heading font-bold text-[40px] lg:text-[48px] tracking-[1px]">
          Hello, I’m the Near stateless explorer
        </h1>
        <h2 className="font-heading font-medium text-[32px] lg:text-[40px] tracking-[0.4px] mt-[-3px]">
          With me, you can check real-time data on the NEAR blockchain.
        </h2>
      </div>
      <hr className="h-px border-0 border-b border-primary/20" />
      <Widget
        key="chart"
        loading={<HomeChartSkeleton />}
        src={`${config_account}/widget/lite.Home.Chart`}
      />
      <Widget
        key="stats"
        loading={<HomeStatsSkeleton />}
        src={`${config_account}/widget/lite.Home.Stats`}
      />
    </div>
  );
};

export default App;
