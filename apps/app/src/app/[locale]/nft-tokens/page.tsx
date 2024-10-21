import List from '@/components/app/Tokens/NFTList';
import { getRequest } from '@/utils/app/api';
import QueryString from 'qs';

export default async function NFTTokens({ searchParams }: any) {
  const dataResult = await getRequest(
    `nfts?sort=txns_day&per_page=50&${QueryString.stringify(searchParams)}`,
  );

  const countResult = await getRequest(
    `nfts/count?${QueryString.stringify(searchParams)}`,
  );

  const handleSearch = async (keyword: string) => {
    'use server';
    const res = await getRequest(`nfts?search=${keyword}&per_page=5`);
    return res.tokens;
  };

  return (
    <List
      data={dataResult}
      tokensCount={countResult}
      handleSearch={handleSearch}
      error={!dataResult}
    />
  );
}
