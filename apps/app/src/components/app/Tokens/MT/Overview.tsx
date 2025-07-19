import { getRequest } from '@/utils/app/api';

import OverviewActions from '@/components/app/Tokens/MT/OverviewActions';
import { MTTokenMeta } from '@/utils/types';

const Overview = async ({ id }: { id: string }) => {
  const decodedId = decodeURIComponent(id);
  const parts = decodedId?.split(':');
  const contract = parts?.[0] ?? '';
  const token = parts?.[1] ?? '';

  const tokenResult = await getRequest(`v2/mts/contract/${contract}/${token}`);
  const tokenMeta: MTTokenMeta = tokenResult?.contracts?.[0];
  // Tokens without metadata are returned as unknown
  const isUnknown: boolean = tokenResult?.contracts?.length === 0;

  return (
    <>
      <OverviewActions
        mtToken={tokenMeta}
        contract={contract}
        token={token}
        isUnknown={isUnknown}
      />
      <div className="py-6"></div>
    </>
  );
};
export default Overview;
