import { AddressesChart } from '@/components/charts/charts';
import { ErrorSuspense } from '@/components/error-suspense';
import { fetchDailyStats } from '@/data/charts';

const AddressesPage = async () => {
  const statsPromise = fetchDailyStats();

  return (
    <>
      <h1 className="text-headline-lg mb-6">Near Unique Accounts Chart</h1>
      <ErrorSuspense fallback={<AddressesChart loading />}>
        <AddressesChart statsPromise={statsPromise} />
      </ErrorSuspense>
    </>
  );
};

export default AddressesPage;
