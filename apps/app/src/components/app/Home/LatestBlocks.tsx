import { getRequest } from '@/utils/app/api';

import LatestBlocks from '../Blocks/Latest';

export default async function HomeLatestBlocks() {
  const blockDetails = await getRequest('blocks/latest');

  const blocks = blockDetails?.blocks || [];

  return (
    <div className="relative ">
      <LatestBlocks blocks={blocks} error={!blocks} />
    </div>
  );
}
