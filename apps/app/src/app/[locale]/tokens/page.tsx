import QueryString from 'qs';

import List from '@/components/app/Tokens/FTList';
import { getRequest } from '@/utils/app/api';

export default async function Tokens(props: any) {
  const searchParams = await props.searchParams;
  const dataResult = await getRequest(
    `fts?per_page=50&${QueryString.stringify(searchParams)}`,
  );

  const countResult = await getRequest(
    `fts/count?${QueryString.stringify(searchParams)}`,
  );

  const statsDetails = await getRequest('stats', {});

  const stats = statsDetails?.stats?.[0];

  const handleSearch = async (keyword: string) => {
    'use server';
    const res = await getRequest(`fts?search=${keyword}&per_page=5`);
    return res.tokens;
  };

  if (dataResult.message === 'Error') {
    throw new Error(`Server Error : ${dataResult.error}`);
  }

  return (
    <List
      data={dataResult}
      error={!dataResult}
      handleSearch={handleSearch}
      stats={stats}
      tokensCount={countResult}
    />
  );
}
