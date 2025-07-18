import { getRequest } from '@/utils/app/api';

import OverviewActions from '@/components/app/Tokens/MT/OverviewActions';
import { MTTokenMeta } from '@/utils/types';

const Overview = async ({
  id,
  searchParams,
}: {
  id: string;
  searchParams: { a: string };
}) => {
  const tokenResult = await getRequest(
    `v2/mts/contract/${searchParams?.a}/${id}`,
  );

  const token: MTTokenMeta = tokenResult?.contracts?.[0];

  return (
    <>
      <OverviewActions mtToken={token} />
      <div className="py-6"></div>
    </>
  );
};
export default Overview;
