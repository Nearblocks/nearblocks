export const runtime = 'edge';

import DexDetails from '@/components/app/Dex/Details';
import { getRequest } from '@/utils/app/api';

export default async function DexDetailsIndex(props: {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ cursor?: string }>;
}) {
  const params = await props.params;
  const { id } = params;
  const searchParams = await props.searchParams;
  const apiUrl = `dex/pairs/${id}`;
  const fetchUrl = `${apiUrl}/txns`;
  const queryParams = {
    ...searchParams,
    per_page: 25,
  };

  const [dexData, dexTxnsListResult, dexTxnsCountResult] = await Promise.all([
    getRequest(apiUrl),
    getRequest(fetchUrl, queryParams),
    getRequest(`${apiUrl}/txns/count`),
  ]);

  return (
    <DexDetails
      dexInfo={dexData}
      dexTxnsCount={dexTxnsCountResult}
      dexTxnsList={dexTxnsListResult}
      error={!dexTxnsListResult}
      id={id}
    />
  );
}
