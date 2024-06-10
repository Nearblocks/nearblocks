const App = () => {
  return (
    <div className="relative container mx-auto">
      <div className="py-[58px] px-6">
        <h1 className="font-heading font-bold text-[49px] tracking-[1px]">
          Hello, I’m the explorer
        </h1>
        <h2 className="font-heading font-medium text-[40px] tracking-[0.4px] mt-[-3px]">
          If I could talk, this is what I would say to you guys.
        </h2>
      </div>
      <hr className="h-px border-0 border-b border-primary/20" />
      <Widget key="chart" src={`${config_account}/widget/lite.Home.Chart`} />
      <Widget key="stats" src={`${config_account}/widget/lite.Home.Stats`} />
    </div>
  );
};

export default App;
