import { getRequest } from '@/utils/app/api';

import LatestBlocks from '../Blocks/Latest';

export default async function HomeLatestBlocks() {
  const blockDetails = await getRequest('v1/blocks/latest');

  const blocks = blockDetails?.blocks || [];

  if (blockDetails.message === 'Error') {
    throw new Error(`Server Error : ${blockDetails.error}`);
  }

  return (
    <div className="relative ">
      <LatestBlocks blocks={blocks} error={!blocks} />
    </div>
  );
}
