import { cookies } from 'next/headers';
import QueryString from 'qs';

import { getRequest } from '@/utils/app/api';
import { RpcProviders } from '@/utils/app/rpc';

import NodeListActions from './NodeListActions';

const getCookieFromRequest = (cookieName: string): null | string => {
  const cookie = cookies().get(cookieName);
  return cookie ? cookie.value : null;
};

export default async function NodeList({ searchParams }: any) {
  const rpcUrl = getCookieFromRequest('rpcUrl') || RpcProviders?.[0]?.url;

  const data = await getRequest(
    `validators?${QueryString.stringify(searchParams)}&rpc=${rpcUrl}`,
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
