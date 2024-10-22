import NodeList from '@/components/app/NodeExplorer/NodeList';
import { getRequest } from '@/utils/app/api';
import { RpcProviders } from '@/utils/app/rpc';
import { cookies } from 'next/headers';
import QueryString from 'qs';

const getCookieFromRequest = (cookieName: string): string | null => {
  const cookie = cookies().get(cookieName);
  return cookie ? cookie.value : null;
};

export default async function NodeExplorer({ searchParams }: any) {
  const rpcUrl = getCookieFromRequest('rpcUrl') || RpcProviders?.[0]?.url;

  const data = await getRequest(
    `validators?${QueryString.stringify(searchParams)}&rpc=${rpcUrl}`,
  );
  const statsDetails = await getRequest('stats');
  const latestBlock = await getRequest('blocks/latest?limit=1');

  return (
    <NodeList
      data={data}
      totalSupply={statsDetails}
      latestBlock={latestBlock}
      error={!data}
    />
  );
}
