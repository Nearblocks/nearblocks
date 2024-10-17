import List from '@/components/app/Tokens/FTList';
import { getRequest } from '@/utils/app/api';
import QueryString from 'qs';

export default async function Tokens({ searchParams }: any) {
  const dataResult = await getRequest(
    `fts?sort=onchain_market_cap&per_page=50&${QueryString.stringify(
      searchParams,
    )}`,
  );

  const countResult = await getRequest(
    `fts/count?${QueryString.stringify(searchParams)}`,
  );

  const handleSearch = async (keyword: string) => {
    'use server';
    const res = await getRequest(`fts?search=${keyword}&per_page=5`);
    return res.tokens;
  };

  return (
    <List
      data={dataResult}
      tokensCount={countResult}
      handleSearch={handleSearch}
      error={false}
    />
  );
}
