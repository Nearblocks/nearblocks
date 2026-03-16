import { Apis } from '@/components/apis';
import { fetchPlans } from '@/data/plans';

const ApisPage = async () => {
  const plansPromise = fetchPlans();
  return (
    <main className="flex flex-1 flex-col py-10">
      <div className="container mx-auto px-4">
        <Apis plansPromise={plansPromise} />
      </div>
    </main>
  );
};

export default ApisPage;
