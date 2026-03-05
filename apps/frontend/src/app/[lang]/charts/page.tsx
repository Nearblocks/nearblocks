import { Charts } from '@/components/charts';
import { fetchDailyStats } from '@/data/charts';

const ChartsPage = async () => {
  const statsPromise = fetchDailyStats(14);

  return (
    <>
      <h1 className="text-headline-lg mb-6">Near Charts & Statistics</h1>
      <Charts statsPromise={statsPromise} />
    </>
  );
};

export default ChartsPage;
