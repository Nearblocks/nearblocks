import QueryString from 'qs';

import List from '@/components/app/Tokens/NFTList';
import { getRequest } from '@/utils/app/api';

export default async function NFTTokens(props: any) {
  const searchParams = await props.searchParams;
  const dataResult = await getRequest(
    `v1/nfts?per_page=50&${QueryString.stringify(searchParams)}`,
  );

  const countResult = await getRequest(
    `v1/nfts/count?${QueryString.stringify(searchParams)}`,
  );

  const handleSearch = async (keyword: string) => {
    'use server';
    const res = await getRequest(`v1/nfts?search=${keyword}&per_page=5`);
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
      tokensCount={countResult}
    />
  );
}
