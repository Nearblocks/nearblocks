import QueryString from 'qs';

import NFTDetails from '@/components/app/Tokens/NFT/NFTDetails';
import { getRequest } from '@/utils/app/api';

export default async function NFTDetailsIndex(props: {
  params: Promise<{ id: string; tid: string }>;
  searchParams: Promise<any>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { id, tid } = params;
  const apiUrl = `nfts/${id}/tokens/${tid}`;
  const fetchUrl = searchParams
    ? `${apiUrl}/txns?${QueryString.stringify(searchParams)}`
    : `${apiUrl}/txns`;

  const [tokenData, txnsListResult, txnsCountResult] = await Promise.all([
    getRequest(apiUrl),
    getRequest(fetchUrl),
    getRequest(`${apiUrl}/txns/count`),
  ]);

  return (
    <NFTDetails
      error={!txnsListResult}
      tokenInfo={tokenData}
      txnsCount={txnsCountResult}
      txnsList={txnsListResult}
    />
  );
}
