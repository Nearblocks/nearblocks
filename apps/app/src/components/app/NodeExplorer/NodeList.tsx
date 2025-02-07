import QueryString from 'qs';

import { getRequest } from '@/utils/app/api';
import NodeListActions from './NodeListActions';

export default async function NodeList({ searchParams }: any) {
  const data = await getRequest(
    `validators?${QueryString.stringify(searchParams)}`,
  );
  const statsDetails = await getRequest('stats');
  const latestBlock = await getRequest('blocks/latest?limit=1');
  return (
    <NodeListActions
      data={data}
      error={!data}
      latestBlock={latestBlock}
      totalSupply={statsDetails}
    />
  );
}
