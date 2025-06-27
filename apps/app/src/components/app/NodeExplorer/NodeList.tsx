import QueryString from 'qs';

import { getRequest } from '@/utils/app/api';
import NodeListActions from '@/components/app/NodeExplorer/NodeListActions';

export default async function NodeList({ searchParams }: any) {
  const data = await getRequest(
    `v1/validators?${QueryString.stringify(searchParams)}`,
  );
  const statsDetails = await getRequest('v1/stats');
  const latestBlock = await getRequest('v1/blocks/latest?limit=1');

  if (data.message === 'Error') {
    throw new Error(`Server Error : ${data.error}`);
  }
  return (
    <NodeListActions
      data={data}
      error={!data}
      latestBlock={latestBlock}
      totalSupply={statsDetails}
    />
  );
}
