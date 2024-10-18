import NFTDetails from '@/components/app/Tokens/NFT/NFTDetails';
import { getRequest } from '@/utils/app/api';
import QueryString from 'qs';

export default async function NFTDetailsIndex({
  params: { id, tid },
  searchParams,
}: {
  params: { id: string; tid: string };
  searchParams: any;
}) {
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
      tokenInfo={tokenData}
      txnsList={txnsListResult}
      txnsCount={txnsCountResult}
      error={!txnsListResult}
      id={id}
      tid={tid}
    />
  );
}
