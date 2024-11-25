import { getRequest } from '@/utils/app/api';

import ListActions from './ListAction';

const List = async ({ searchParams }: any) => {
  const params = {
    ...searchParams,
    per_page: 50,
  };
  const data = await getRequest(`dex`, params);
  const { search } = searchParams;
  const dataCount = await getRequest('dex/count', { search });

  const handleSearch = async (keyword: string) => {
    'use server';

    const res = await getRequest(`dex?search=${keyword}&per_page=5`);
    return res.pairs;
  };

  return (
    <ListActions
      data={data}
      dataCount={dataCount}
      error={!data}
      handleSearch={handleSearch}
    />
  );
};
export default List;
